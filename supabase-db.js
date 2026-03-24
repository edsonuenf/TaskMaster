let secaoAtual = 'projetos';
let projetosCache = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarProjetos();
});

// ==================== NAVEGAÇÃO ====================

function showSection(secao) {
    secaoAtual = secao;
    document.getElementById('section-projetos').classList.toggle('hidden', secao !== 'projetos');
    document.getElementById('section-tarefas').classList.toggle('hidden', secao !== 'tarefas');
    document.getElementById('page-title').textContent = secao === 'projetos' ? 'Projetos' : 'Tarefas';
    document.getElementById('btn-novo-texto').textContent = secao === 'projetos' ? 'Novo Projeto' : 'Nova Tarefa';

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-primary/20', 'text-primary');
        btn.classList.add('text-gray-400');
    });
    document.getElementById('btn-' + secao).classList.add('bg-primary/20', 'text-primary');
    document.getElementById('btn-' + secao).classList.remove('text-gray-400');

    if (secao === 'tarefas') carregarTarefas();
}

// ==================== PROJETOS ====================

async function carregarProjetos() {
    console.log('Carregando projetos...');
    const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .order('criado_em', { ascending: false });

    console.log('Resultado projetos:', { data, error });

    if (error) {
        showToast('Erro ao carregar projetos: ' + error.message);
        return;
    }

    projetosCache = data || [];
    renderizarProjetos(projetosCache);
    atualizarSelectProjetos(projetosCache);
}

function renderizarProjetos(projetos) {
    const container = document.getElementById('lista-projetos');
    const empty = document.getElementById('empty-projetos');

    if (projetos.length === 0) {
        container.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    container.innerHTML = projetos.map(p => `
        <div class="glass-card rounded-xl p-6 hover:border-primary/30 transition-all group">
            <div class="flex items-start justify-between mb-4">
                <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                    </svg>
                </div>
                <button onclick="deletarProjeto('${p.id}')" class="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
            <h3 class="text-lg font-bold mb-2">${p.nome}</h3>
            <p class="text-gray-400 text-sm mb-4 line-clamp-2">${p.descricao || 'Sem descrição'}</p>
            <div class="flex items-center justify-between text-xs text-gray-500">
                <span>${formatarData(p.criado_em)}</span>
                <span class="px-2 py-1 rounded-full bg-primary/20 text-primary">${p.tarefas_count || 0} tarefas</span>
            </div>
        </div>
    `).join('');
}

async function criarProjeto(nome, descricao) {
    console.log('Criando projeto:', { nome, descricao });
    const { data, error } = await supabase
        .from('projetos')
        .insert({ nome, descricao })
        .select()
        .single();

    console.log('Resultado criar projeto:', { data, error });

    if (error) {
        showToast('Erro ao criar projeto: ' + error.message);
        return null;
    }

    showToast('Projeto criado com sucesso!');
    carregarProjetos();
    return data;
}

async function deletarProjeto(id) {
    if (!confirm('Deseja realmente excluir este projeto e todas as suas tarefas?')) return;

    const { error } = await supabase
        .from('projetos')
        .delete()
        .eq('id', id);

    if (error) {
        showToast('Erro ao deletar projeto: ' + error.message);
        return;
    }

    showToast('Projeto excluído!');
    carregarProjetos();
}

// ==================== TAREFAS ====================

async function carregarTarefas() {
    const projetoId = document.getElementById('filtro-projeto').value;
    let query = supabase
        .from('tarefas')
        .select('*, projetos(nome)')
        .order('criado_em', { ascending: false });

    if (projetoId) query = query.eq('projeto_id', projetoId);

    const { data, error } = await query;

    if (error) {
        showToast('Erro ao carregar tarefas: ' + error.message);
        return;
    }

    renderizarTarefas(data || []);
}

function renderizarTarefas(tarefas) {
    const container = document.getElementById('lista-tarefas');
    const empty = document.getElementById('empty-tarefas');

    if (tarefas.length === 0) {
        container.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    container.innerHTML = tarefas.map(t => `
        <div class="glass-card rounded-lg p-4 flex items-center gap-4 hover:border-primary/30 transition-all group ${t.concluida ? 'opacity-60' : ''}">
            <button onclick="toggleTarefa('${t.id}', ${!t.concluida})" class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${t.concluida ? 'bg-cta border-cta' : 'border-gray-500 hover:border-primary'}">
                ${t.concluida ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ''}
            </button>
            <div class="flex-1 min-w-0">
                <h4 class="font-medium ${t.concluida ? 'line-through text-gray-500' : 'text-white'}">${t.titulo}</h4>
                <p class="text-xs text-gray-500 mt-1">${t.projetos?.nome || 'Sem projeto'}</p>
            </div>
            <span class="text-xs px-2 py-1 rounded-full ${getPrioridadeClass(t.prioridade)}">${t.prioridade}</span>
            <button onclick="deletarTarefa('${t.id}')" class="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    `).join('');
}

async function criarTarefa(projetoId, titulo, prioridade) {
    const { error } = await supabase
        .from('tarefas')
        .insert({ projeto_id: projetoId, titulo, prioridade });

    if (error) {
        showToast('Erro ao criar tarefa: ' + error.message);
        return;
    }

    showToast('Tarefa criada com sucesso!');
    carregarTarefas();
    carregarProjetos();
}

async function toggleTarefa(id, concluida) {
    const { error } = await supabase
        .from('tarefas')
        .update({ concluida })
        .eq('id', id);

    if (error) {
        showToast('Erro ao atualizar tarefa: ' + error.message);
        return;
    }

    carregarTarefas();
}

async function deletarTarefa(id) {
    const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id);

    if (error) {
        showToast('Erro ao deletar tarefa: ' + error.message);
        return;
    }

    showToast('Tarefa excluída!');
    carregarTarefas();
    carregarProjetos();
}

// ==================== MODAL ====================

function openModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    if (secaoAtual === 'projetos') {
        document.getElementById('modal-titulo').textContent = 'Novo Projeto';
        document.getElementById('form-projeto').classList.remove('hidden');
        document.getElementById('form-tarefa').classList.add('hidden');
        document.getElementById('btn-salvar').textContent = 'Criar Projeto';
    } else {
        document.getElementById('modal-titulo').textContent = 'Nova Tarefa';
        document.getElementById('form-projeto').classList.add('hidden');
        document.getElementById('form-tarefa').classList.remove('hidden');
        document.getElementById('btn-salvar').textContent = 'Criar Tarefa';
        atualizarSelectProjetos(projetosCache);
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('form-modal').reset();
}

async function handleFormSubmit(event) {
    event.preventDefault();

    if (secaoAtual === 'projetos') {
        const nome = document.getElementById('projeto-nome').value.trim();
        const descricao = document.getElementById('projeto-descricao').value.trim();
        await criarProjeto(nome, descricao);
    } else {
        const projetoId = document.getElementById('tarefa-projeto').value;
        const titulo = document.getElementById('tarefa-titulo').value.trim();
        const prioridade = document.getElementById('tarefa-prioridade').value;
        await criarTarefa(projetoId, titulo, prioridade);
    }

    closeModal();
}

// ==================== HELPERS ====================

function atualizarSelectProjetos(projetos) {
    const selects = [document.getElementById('filtro-projeto'), document.getElementById('tarefa-projeto')];
    selects.forEach(select => {
        if (!select) return;
        const currentValue = select.value;
        const firstOption = select.querySelector('option:first-child');
        select.innerHTML = '';
        select.appendChild(firstOption);
        projetos.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.nome;
            select.appendChild(option);
        });
        select.value = currentValue;
    });
}

function getPrioridadeClass(prioridade) {
    switch (prioridade) {
        case 'alta': return 'bg-red-500/20 text-red-400';
        case 'media': return 'bg-yellow-500/20 text-yellow-400';
        case 'baixa': return 'bg-green-500/20 text-green-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
}

function formatarData(dataStr) {
    if (!dataStr) return '';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}
