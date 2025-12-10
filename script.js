const API_URL = 'http://localhost:3000';
let usuarioAtual = null;
let filmeAtualId = null;

document.addEventListener('DOMContentLoaded', () => {
    verificarUsuarioLogado();
    carregarFilmes();
    

    document.getElementById('formCadastro').addEventListener('submit', cadastrarUsuario);
    document.getElementById('formLogin').addEventListener('submit', fazerLogin);
    document.getElementById('formAddFilme').addEventListener('submit', adicionarFilme);
    document.getElementById('formComentario').addEventListener('submit', adicionarComentario);
});


function mostrarPagina(pagina) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pagina).classList.add('active');
    
    if (pagina === 'home') {
        carregarFilmes();
    }
}

function voltarHome() {
    mostrarPagina('home');
}


function mostrarAlerta(mensagem, tipo) {

    const alertaExistente = document.querySelector('.alerta-notificacao');
    if (alertaExistente) {
        alertaExistente.remove();
    }
    
    const alerta = document.createElement('div');
    alerta.className = `alerta-notificacao alerta-${tipo}`;
    alerta.innerHTML = `
        <span>${mensagem}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(alerta);
    

    setTimeout(() => {
        if (alerta.parentElement) {
            alerta.classList.add('fade-out');
            setTimeout(() => alerta.remove(), 300);
        }
    }, 4000);
}

function verificarUsuarioLogado() {
    const usuario = localStorage.getItem('usuario');
    

    const navLogin = document.getElementById('navLogin');
    const navCadastro = document.getElementById('navCadastro');
    const btnAddFilme = document.getElementById('btnAddFilme');
    const btnLogout = document.getElementById('btnLogout');
    const userInfo = document.getElementById('userInfo');

    if (usuario) {
        usuarioAtual = JSON.parse(usuario);
        
   
        userInfo.style.display = 'inline-block';
        userInfo.textContent = `Olá, ${usuarioAtual.nome}`;
        btnAddFilme.style.display = 'inline-block';
        btnLogout.style.display = 'inline-block';
        
       
        if (navLogin) navLogin.style.display = 'none';
        if (navCadastro) navCadastro.style.display = 'none';
    } else {
 
        usuarioAtual = null;
        userInfo.style.display = 'none';
        btnAddFilme.style.display = 'none';
        btnLogout.style.display = 'none';
        
 
        if (navLogin) navLogin.style.display = 'inline-block';
        if (navCadastro) navCadastro.style.display = 'inline-block';
    }
}

function logout() {
    localStorage.removeItem('usuario');
    usuarioAtual = null;
    mostrarAlerta('Logout realizado com sucesso! 👋', 'success');
    
    verificarUsuarioLogado(); 
    
    setTimeout(() => mostrarPagina('home'), 1000);
}

async function cadastrarUsuario(e) {
    e.preventDefault();
    
    const nome = document.getElementById('cadNome').value;
    const email = document.getElementById('cadEmail').value;
    const senha = document.getElementById('cadSenha').value;
    

    if (!nome || !email || !senha) {
        mostrarAlerta('Preencha todos os campos', 'error');
        return;
    }
    
    if (senha.length < 6) {
        mostrarAlerta('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/usuarios/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarAlerta('Cadastro realizado com sucesso!', 'success');
            document.getElementById('formCadastro').reset();
            setTimeout(() => mostrarPagina('login'), 1500);
        } else {
            mostrarAlerta(data.message || 'Erro ao cadastrar', 'error');
        }
    } catch (error) {
        mostrarAlerta('Erro ao conectar com o servidor. Verifique se a API está rodando!', 'error');
        console.error(error);
    }
}

async function fazerLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;
    
    
    try {
        const response = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();

        console.log("Resposta do servidor:", data); 

        if (response.ok && (data.success || data.id || data.access_token)) { 
            
            
            usuarioAtual = data.data || data; 
            localStorage.setItem('usuario', JSON.stringify(usuarioAtual));
            
            verificarUsuarioLogado();
            mostrarAlerta('Login realizado com sucesso!', 'success');
            document.getElementById('formLogin').reset();
            setTimeout(() => mostrarPagina('home'), 1000);
        } else {
            mostrarAlerta(data.message || 'Email ou senha inválidos', 'error');
        }
    } catch (error) {
        
    }
}
function logout() {
    localStorage.removeItem('usuario');
    usuarioAtual = null;
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('btnAddFilme').style.display = 'none';
    document.getElementById('btnLogout').style.display = 'none';
    mostrarAlerta('Logout realizado com sucesso! 👋', 'success');
    setTimeout(() => mostrarPagina('home'), 1000);
}


async function carregarFilmes() {
    const container = document.getElementById('filmesList');
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: #64748b;">⏳ Carregando filmes...</p>';
    
    try {
        const response = await fetch(`${API_URL}/filmes`);
        const filmes = await response.json();
        
        container.innerHTML = '';
        
        if (filmes.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">🎬 Nenhum filme cadastrado.</p>';
            return;
        }
        
        for (const filme of filmes) {
            let media = 0;
            try {
                const mediaResponse = await fetch(`${API_URL}/avaliacoes/filme/${filme.id}/media`);
                const dadosMedia = await mediaResponse.json();
                media = dadosMedia.media;
            } catch (e) { console.log('Erro ao buscar média'); }
            
            const card = document.createElement('div');
            card.className = 'filme-card';
            card.onclick = () => verDetalhesFilme(filme.id);
            
            card.innerHTML = `
                <img src="${filme.posterUrl}" 
                     alt="${filme.titulo}" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x450?text=Sem+Imagem'">
                <div class="filme-info">
                    <h3>${filme.titulo}</h3>
                    <p>${filme.ano} • ${filme.genero}</p>
                    <p class="media-avaliacao">⭐ ${media > 0 ? media.toFixed(1) : 'N/A'}</p>
                </div>
            `;
            container.appendChild(card);
        }
    } catch (error) {
        container.innerHTML = '<p style="text-align: center; color: red;">❌ Erro ao conectar na API.</p>';
    }
}

async function buscarFilmes() {
    const titulo = document.getElementById('searchInput').value;
    
    try {
        const url = titulo ? `${API_URL}/filmes?titulo=${titulo}` : `${API_URL}/filmes`;
        const response = await fetch(url);
        const filmes = await response.json();
        
        const container = document.getElementById('filmesList');
        container.innerHTML = '';
        
        for (const filme of filmes) {
            const mediaResponse = await fetch(`${API_URL}/avaliacoes/filme/${filme.id}/media`);
            const { media } = await mediaResponse.json();
            
            const card = document.createElement('div');
            card.className = 'filme-card';
            card.onclick = () => verDetalhesFilme(filme.id);
            
            card.innerHTML = `
                <img src="${filme.posterUrl}" alt="${filme.titulo}">
                <div class="filme-info">
                    <h3>${filme.titulo}</h3>
                    <p>${filme.ano} - ${filme.genero}</p>
                    <p class="media-avaliacao">⭐ ${media > 0 ? media.toFixed(1) : 'Sem avaliações'}</p>
                </div>
            `;
            
            container.appendChild(card);
        }
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
    }
}

async function adicionarFilme(e) {
    e.preventDefault();
    
    if (!usuarioAtual) {
        mostrarAlerta('Você precisa estar logado para adicionar filmes', 'error');
        return;
    }
    
    const filme = {
        titulo: document.getElementById('filmeTitulo').value,
        sinopse: document.getElementById('filmeSinopse').value,
        diretor: document.getElementById('filmeDiretor').value,
        ano: parseInt(document.getElementById('filmeAno').value),
        genero: document.getElementById('filmeGenero').value,
        posterUrl: document.getElementById('filmePoster').value
    };
    
    try {
        const response = await fetch(`${API_URL}/filmes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filme)
        });
        
        if (response.ok) {
            mostrarAlerta('Filme adicionado com sucesso! 🎬', 'success');
            document.getElementById('formAddFilme').reset();
            setTimeout(() => mostrarPagina('home'), 1500);
        } else {
            mostrarAlerta('Erro ao adicionar filme', 'error');
        }
    } catch (error) {
        mostrarAlerta('Erro ao conectar com o servidor', 'error');
        console.error(error);
    }
}

async function verDetalhesFilme(id) {
    filmeAtualId = id;
    
    try {
        const response = await fetch(`${API_URL}/filmes/${id}`);
        const filme = await response.json();
        
        let media = 0;
        try {
            const mediaResponse = await fetch(`${API_URL}/avaliacoes/filme/${id}/media`);
            const dadosMedia = await mediaResponse.json();
            media = dadosMedia.media;
        } catch (e) {}
        
        const detalhesDiv = document.getElementById('filmeDetalhes');
        
        const btnDeletar = usuarioAtual 
            ? `<button onclick="removerFilme(${id})" style="background-color: #ef4444; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; margin-top: 15px;">🗑️ Excluir Filme</button>` 
            : '';

        detalhesDiv.innerHTML = `
            <div class="filme-detalhes-container">
                <img src="${filme.posterUrl}" 
                     alt="${filme.titulo}"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x450?text=Sem+Imagem'">
                <div class="filme-detalhes-info">
                    <h2>${filme.titulo}</h2>
                    <p><strong>Diretor:</strong> ${filme.diretor}</p>
                    <p><strong>Ano:</strong> ${filme.ano}</p>
                    <p><strong>Gênero:</strong> ${filme.genero}</p>
                    <p><strong>Avaliação:</strong> ⭐ ${media > 0 ? media.toFixed(1) : 'N/A'}</p>
                    <p class="sinopse-texto">${filme.sinopse}</p>
                    ${btnDeletar}
                </div>
            </div>
        `;

        if (usuarioAtual) {
            document.getElementById('avaliacaoSection').style.display = 'block';
            document.getElementById('comentarioSection').style.display = 'block';
        } else {
            document.getElementById('avaliacaoSection').style.display = 'none';
            document.getElementById('comentarioSection').style.display = 'none';
        }
        
        await carregarComentarios(id);
        mostrarPagina('detalhes');
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function removerFilme(id) {
    if (!confirm('Tem certeza absoluta que deseja excluir este filme? Todos os comentários e avaliações também serão apagados.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/filmes/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        let data = {};
        try {
            data = await response.json();
        } catch (e) {
        }

        if (response.ok) {
            mostrarAlerta('Filme removido com sucesso!', 'success');

            const pageHome = document.getElementById('home');
            if (pageHome.classList.contains('active')) {
                carregarFilmes(); 
            } else {
                setTimeout(() => mostrarPagina('home'), 1000); 
            }
            
        } else {
           
            const mensagemErro = data.message || 'Erro desconhecido ao excluir o filme.';
            mostrarAlerta(`Erro: ${mensagemErro}`, 'error');
        }

    } catch (error) {
        console.error('Erro:', error);
        mostrarAlerta('Erro de conexão com o servidor.', 'error');
    }
}


async function avaliarFilme(nota) {
    if (!usuarioAtual) {
        mostrarAlerta('Você precisa estar logado para avaliar', 'error');
        return;
    }
    

    document.querySelectorAll('#avaliacaoEstrelas span').forEach((star, index) => {
        if (index < nota) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    try {
        const response = await fetch(`${API_URL}/avaliacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuarioId: usuarioAtual.id,
                filmeId: filmeAtualId,
                nota: nota
            })
        });
        
        if (response.ok) {
            mostrarAlerta(`Você avaliou com ${nota} estrela(s)! ⭐`, 'success');
            setTimeout(() => verDetalhesFilme(filmeAtualId), 1500);
        } else {
            mostrarAlerta('Erro ao avaliar filme', 'error');
        }
    } catch (error) {
        mostrarAlerta('Erro ao conectar com o servidor', 'error');
        console.error(error);
    }
}


async function carregarComentarios(filmeId) {
    try {
        const response = await fetch(`${API_URL}/comentarios/filme/${filmeId}`);
        const comentarios = await response.json();
        
        const container = document.getElementById('comentarios');
        container.innerHTML = '';
        
        if (comentarios.length === 0) {
            container.innerHTML = '<p>Nenhum comentário ainda. Seja o primeiro!</p>';
            return;
        }
        
        comentarios.forEach(comentario => {
            const div = document.createElement('div');
            div.className = 'comentario-item';
            div.innerHTML = `
                <div class="comentario-autor">${comentario.usuario.nome}</div>
                <div class="comentario-texto">${comentario.texto}</div>
                <div class="comentario-data">${new Date(comentario.dataCriacao).toLocaleDateString('pt-BR')}</div>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Erro ao carregar comentários:', error);
    }
}

async function adicionarComentario(e) {
    e.preventDefault();
    
    if (!usuarioAtual) {
        mostrarAlerta('Você precisa estar logado para comentar', 'error');
        return;
    }
    
    const texto = document.getElementById('comentarioTexto').value;
    
    if (!texto.trim()) {
        mostrarAlerta('Digite um comentário válido', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/comentarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuarioId: usuarioAtual.id,
                filmeId: filmeAtualId,
                texto: texto
            })
        });
        
        if (response.ok) {
            mostrarAlerta('Comentário adicionado com sucesso! 💬', 'success');
            document.getElementById('comentarioTexto').value = '';
            await carregarComentarios(filmeAtualId);
        } else {
            mostrarAlerta('Erro ao adicionar comentário', 'error');
        }
    } catch (error) {
        mostrarAlerta('Erro ao conectar com o servidor', 'error');
        console.error(error);
    }
}