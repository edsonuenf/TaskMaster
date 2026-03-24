let projetosCache = [];
let tarefasCache = [];
let modoEdicao = null;
let projetoExpandido = null;

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
});

async function carregarDados() {
    const { data: projetos } = await supabaseClient
        .from('projetos')
        .select('*')
        .order('criado_em', { ascending: false });

    const { data: tarefas } = await supabaseClient
        .from('tarefas')
        .select('*')
        .order('criado_em', { ascending: false });

    projetosCache = projetos || [];
    tarefasCache = tarefas || [];
    renderizarProjetos();
}

// ==================== RENDERIZAÇÃO ====================

function renderizarProjetos() {
    const container = document.getElementById('lista-projetos');
    const empty = document.getElementById('empty-projetos');

    if (projetosCache.length === 0) {
        container.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    container.innerHTML = projetosCache.map(p => {
        const tarefasDoProjeto = tarefasCache.filter(t => t.projeto_id === p.id);
        const isExpandido = projetoExpandido === p.id;
        const totalTarefas = tarefasDoProjeto.length;
        const concluidas = tarefasDoProjeto.filter(t => t.concluida).length;

        return `
        <div class="glass-card rounded-xl overflow-hidden">
            <!-- Header do Projeto -->
            <div class="p-6 cursor-pointer hover:bg-white/5 transition-colors" onclick="toggleProjeto('${p.id}')">
                <div class="flex items-start justify-between mb-3">
                    <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                        </svg>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">${concluidas}/${totalTarefas}</span>
                        <button onclick="event.stopPropagation(); editarProjeto('${p.id}')" class="text-gray-400 hover:text-primary transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onclick="event.stopPropagation(); deletarProjeto('${p.id}')" class="text-gray-400 hover:text-red-500 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        <svg class="w-5 h-5 text-gray-400 transition-transform ${isExpandido ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
                <h3 class="text-lg font-bold mb-1">${p.nome}</h3>
                <p class="text-gray-400 text-sm">${p.descricao || 'Sem descrição'}</p>
                <div class="mt-3">
                    <div class="w-full bg-white/5 rounded-full h-1.5">
                        <div class="bg-cta h-1.5 rounded-full transition-all" style="width: ${totalTarefas > 0 ? (concluidas / totalTarefas * 100) : 0}%"></div>
                    </div>
                </div>
            </div>

            <!-- Tarefas do Projeto -->
            <div class="${isExpandido ? '' : 'hidden'}">
                <div class="border-t border-white/5 px-6 py-4">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-sm font-medium text-gray-400">Tarefas</span>
                        <button onclick="event.stopPropagation(); openModalTarefa('${p.id}')" class="text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30 transition-colors flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            Nova Tarefa
                        </button>
                    </div>
                    ${tarefasDoProjeto.length === 0 ? `
                        <p class="text-gray-600 text-sm text-center py-4">Nenhuma tarefa neste projeto.</p>
                    ` : `
                        <div class="space-y-2">
                            ${tarefasDoProjeto.map(t => renderizarTarefa(t)).join('')}
                        </div>
                    `}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function renderizarTarefa(t) {
    return `
        <div class="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group ${t.concluida ? 'opacity-50' : ''}">
            <button onclick="toggleTarefa('${t.id}', ${!t.concluida})" class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${t.concluida ? 'bg-cta border-cta' : 'border-gray-500 hover:border-primary'}">
                ${t.concluida ? '<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ''}
            </button>
            <div class="flex-1 min-w-0">
                <p class="text-sm ${t.concluida ? 'line-through text-gray-500' : 'text-white'}">${t.titulo}</p>
                <div class="flex flex-wrap items-center gap-1.5 mt-1">
                    <span class="text-[10px] px-1.5 py-0.5 rounded ${getPrioridadeClass(t.prioridade)}">${t.prioridade}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded ${getStatusClass(t.status)}">${formatarStatus(t.status)}</span>
                    ${t.tipo_post ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">${t.tipo_post}${t.nome_colunista ? ': ' + t.nome_colunista : ''}</span>` : ''}
                    ${t.data_entrega ? `<span class="text-[10px] px-1.5 py-0.5 rounded ${getDataEntregaClass(t.data_entrega)}">${formatarData(t.data_entrega)}</span>` : ''}
                </div>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="editarTarefa('${t.id}')" class="text-gray-400 hover:text-primary transition-colors p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button onclick="deletarTarefa('${t.id}')" class="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>
    `;
}

function toggleProjeto(id) {
    projetoExpandido = projetoExpandido === id ? null : id;
    renderizarProjetos();
}

// ==================== PROJETOS CRUD ====================

function editarProjeto(id) {
    const projeto = projetosCache.find(p => p.id === id);
    if (!projeto) return;

    modoEdicao = { tipo: 'projeto', id };
    document.getElementById('modal-titulo').textContent = 'Editar Projeto';
    document.getElementById('btn-salvar').textContent = 'Salvar Alterações';
    document.getElementById('form-projeto').classList.remove('hidden');
    document.getElementById('form-tarefa').classList.add('hidden');

    document.getElementById('projeto-nome').value = projeto.nome;
    document.getElementById('projeto-descricao').value = projeto.descricao || '';

    openModalElement();
}

async function criarProjeto(nome, descricao) {
    const { error } = await supabaseClient
        .from('projetos')
        .insert({ nome, descricao });

    if (error) { showToast('Erro: ' + error.message); return; }
    showToast('Projeto criado!');
    carregarDados();
}

async function atualizarProjeto(id, nome, descricao) {
    const { error } = await supabaseClient
        .from('projetos')
        .update({ nome, descricao })
        .eq('id', id);

    if (error) { showToast('Erro: ' + error.message); return; }
    showToast('Projeto atualizado!');
    carregarDados();
}

async function deletarProjeto(id) {
    if (!confirm('Excluir este projeto e todas as suas tarefas?')) return;
    const { error } = await supabaseClient.from('projetos').delete().eq('id', id);
    if (error) { showToast('Erro: ' + error.message); return; }
    showToast('Projeto excluído!');
    carregarDados();
}

// ==================== TAREFAS CRUD ====================

function openModalTarefa(projetoId) {
    modoEdicao = null;
    document.getElementById('modal-titulo').textContent = 'Nova Tarefa';
    document.getElementById('btn-salvar').textContent = 'Criar Tarefa';
    document.getElementById('form-projeto').classList.add('hidden');
    document.getElementById('form-tarefa').classList.remove('hidden');
    document.getElementById('tarefa-projeto-id').value = projetoId;
    document.getElementById('form-modal').reset();
    document.getElementById('tarefa-projeto-id').value = projetoId;
    openModalElement();
}

function editarTarefa(id) {
    const tarefa = tarefasCache.find(t => t.id === id);
    if (!tarefa) return;

    modoEdicao = { tipo: 'tarefa', id };
    document.getElementById('modal-titulo').textContent = 'Editar Tarefa';
    document.getElementById('btn-salvar').textContent = 'Salvar Alterações';
    document.getElementById('form-projeto').classList.add('hidden');
    document.getElementById('form-tarefa').classList.remove('hidden');

    document.getElementById('tarefa-projeto-id').value = tarefa.projeto_id;
    document.getElementById('tarefa-titulo').value = tarefa.titulo;
    document.getElementById('tarefa-tipo-post').value = tarefa.tipo_post || '';
    document.getElementById('tarefa-status').value = tarefa.status || 'pendente';
    document.getElementById('tarefa-prioridade').value = tarefa.prioridade || 'media';
    document.getElementById('tarefa-data-entrega').value = tarefa.data_entrega || '';
    document.getElementById('tarefa-nome-colunista').value = tarefa.nome_colunista || '';
    toggleColunista();

    openModalElement();
}

async function criarTarefa(projetoId, titulo, prioridade, tipo_post, status, data_entrega, nome_colunista) {
    const payload = { projeto_id: projetoId, titulo, prioridade, tipo_post, status, data_entrega };
    if (nome_colunista) payload.nome_colunista = nome_colunista;
    console.log('Criando tarefa:', payload);
    const { error } = await supabaseClient
        .from('tarefas')
        .insert(payload);

    if (error) { console.error('Erro Supabase:', error); showToast('Erro: ' + error.message); return; }
    showToast('Tarefa criada!');
    projetoExpandido = projetoId;
    carregarDados();
}

async function atualizarTarefa(id, projetoId, titulo, prioridade, tipo_post, status, data_entrega, nome_colunista) {
    const payload = { projeto_id: projetoId, titulo, prioridade, tipo_post, status, data_entrega };
    if (nome_colunista) payload.nome_colunista = nome_colunista;
    const { error } = await supabaseClient
        .from('tarefas')
        .update(payload)
        .eq('id', id);

    if (error) { console.error('Erro Supabase:', error); showToast('Erro: ' + error.message); return; }
    showToast('Tarefa atualizada!');
    carregarDados();
}

async function toggleTarefa(id, concluida) {
    await supabaseClient.from('tarefas').update({ concluida }).eq('id', id);
    carregarDados();
}

async function deletarTarefa(id) {
    await supabaseClient.from('tarefas').delete().eq('id', id);
    showToast('Tarefa excluída!');
    carregarDados();
}

// ==================== MODAL ====================

function openModal() {
    modoEdicao = null;
    document.getElementById('modal-titulo').textContent = 'Novo Projeto';
    document.getElementById('btn-salvar').textContent = 'Criar Projeto';
    document.getElementById('form-projeto').classList.remove('hidden');
    document.getElementById('form-tarefa').classList.add('hidden');
    document.getElementById('form-modal').reset();
    openModalElement();
}

function openModalElement() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modal').classList.add('flex');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal').classList.remove('flex');
    document.getElementById('form-modal').reset();
    modoEdicao = null;
}

async function handleFormSubmit(event) {
    event.preventDefault();

    if (modoEdicao) {
        if (modoEdicao.tipo === 'projeto') {
            const nome = document.getElementById('projeto-nome').value.trim();
            const descricao = document.getElementById('projeto-descricao').value.trim();
            if (!nome) { showToast('Nome é obrigatório'); return; }
            await atualizarProjeto(modoEdicao.id, nome, descricao);
        } else {
            const projetoId = document.getElementById('tarefa-projeto-id').value;
            const titulo = document.getElementById('tarefa-titulo').value.trim();
            const prioridade = document.getElementById('tarefa-prioridade').value;
            const tipo_post = document.getElementById('tarefa-tipo-post').value;
            const status = document.getElementById('tarefa-status').value;
            const data_entrega = document.getElementById('tarefa-data-entrega').value || null;
            const nome_colunista = tipo_post === 'colunista' ? document.getElementById('tarefa-nome-colunista').value.trim() : null;
            if (!titulo) { showToast('Título é obrigatório'); return; }
            await atualizarTarefa(modoEdicao.id, projetoId, titulo, prioridade, tipo_post, status, data_entrega, nome_colunista);
        }
    } else {
        if (document.getElementById('form-projeto').classList.contains('hidden')) {
            const projetoId = document.getElementById('tarefa-projeto-id').value;
            const titulo = document.getElementById('tarefa-titulo').value.trim();
            const prioridade = document.getElementById('tarefa-prioridade').value;
            const tipo_post = document.getElementById('tarefa-tipo-post').value;
            const status = document.getElementById('tarefa-status').value;
            const data_entrega = document.getElementById('tarefa-data-entrega').value || null;
            const nome_colunista = tipo_post === 'colunista' ? document.getElementById('tarefa-nome-colunista').value.trim() : null;
            if (!titulo) { showToast('Título é obrigatório'); return; }
            await criarTarefa(projetoId, titulo, prioridade, tipo_post, status, data_entrega, nome_colunista);
        } else {
            const nome = document.getElementById('projeto-nome').value.trim();
            const descricao = document.getElementById('projeto-descricao').value.trim();
            if (!nome) { showToast('Nome é obrigatório'); return; }
            await criarProjeto(nome, descricao);
        }
    }

    closeModal();
}

// ==================== HELPERS ====================

function toggleColunista() {
    const tipo = document.getElementById('tarefa-tipo-post').value;
    document.getElementById('campo-colunista').classList.toggle('hidden', tipo !== 'colunista');
}

function getPrioridadeClass(p) {
    return { alta: 'bg-red-500/20 text-red-400', media: 'bg-yellow-500/20 text-yellow-400', baixa: 'bg-green-500/20 text-green-400' }[p] || 'bg-gray-500/20 text-gray-400';
}

function getStatusClass(s) {
    return { pendente: 'bg-gray-500/20 text-gray-400', em_andamento: 'bg-blue-500/20 text-blue-400', em_revisao: 'bg-yellow-500/20 text-yellow-400', aprovado: 'bg-green-500/20 text-green-400', publicado: 'bg-purple-500/20 text-purple-400' }[s] || 'bg-gray-500/20 text-gray-400';
}

function formatarStatus(s) {
    return { pendente: 'Pendente', em_andamento: 'Em Andamento', em_revisao: 'Em Revisão', aprovado: 'Aprovado', publicado: 'Publicado' }[s] || s;
}

function getDataEntregaClass(data) {
    if (!data) return 'bg-gray-500/20 text-gray-400';
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const diff = Math.ceil((new Date(data + 'T00:00:00') - hoje) / 86400000);
    if (diff < 0) return 'bg-red-500/20 text-red-400';
    if (diff <= 2) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-blue-500/20 text-blue-400';
}

function formatarData(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
}
