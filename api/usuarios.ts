import { neon } from '@neondatabase/serverless';

// 🟢 MÉTODO GET: Listar todos os usuários para mostrar na tabela da Home
export async function GET(request: Request) {
  const urlBanco = process.env['DATABASE_URL'];
  if (!urlBanco) return new Response(JSON.stringify({ erro: 'Banco não configurado.' }), { status: 500 });

  const sql = neon(urlBanco);
  try {
    const usuarios = await sql`SELECT id, nome, sobrenome, email, role, data_nascimento FROM usuarios ORDER BY id ASC`;
    return new Response(JSON.stringify(usuarios), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ erro: error.message }), { status: 500 });
  }
}

// 🔵 MÉTODO POST: Criar novos usuários (Seja pela tela externa ou por dentro da Home)
export async function POST(request: Request) {
  const urlBanco = process.env['DATABASE_URL'];
  if (!urlBanco) return new Response(JSON.stringify({ erro: 'Banco não configurado.' }), { status: 500 });

  const sql = neon(urlBanco);
  try {
    const corpo = await request.json();
    const { nome, sobrenome, email, senha, dataNascimento, role } = corpo;

    if (!nome || !sobrenome || !email || !senha || !dataNascimento) {
      return new Response(JSON.stringify({ erro: 'Campos obrigatórios ausentes.' }), { status: 400 });
    }

    // Define 'user' como padrão caso não venha nenhuma role específica
    const nivelAcesso = role || 'user';

    await sql`
      INSERT INTO usuarios (nome, sobrenome, email, senha, data_nascimento, role)
      VALUES (${nome}, ${sobrenome}, ${email}, ${senha}, ${dataNascimento}, ${nivelAcesso})
    `;

    return new Response(JSON.stringify({ mensagem: 'Usuário criado com sucesso!' }), { status: 201 });
  } catch (error: any) {
    if (error.message.includes('unique constraint')) {
      return new Response(JSON.stringify({ erro: 'Este e-mail já existe.' }), { status: 400 });
    }
    return new Response(JSON.stringify({ erro: error.message }), { status: 500 });
  }
}

// 🟡 MÉTODO PUT: Alterar dados de um usuário existente (Nome, Sobrenome, E-mail, Senha, Role, etc.)
export async function PUT(request: Request) {
  const urlBanco = process.env['DATABASE_URL'];
  if (!urlBanco) return new Response(JSON.stringify({ erro: 'Banco não configurado.' }), { status: 500 });

  const sql = neon(urlBanco);
  try {
    const corpo = await request.json();
    const { id, nome, sobrenome, email, senha, dataNascimento, role } = corpo;

    if (!id || !nome || !sobrenome || !email || !dataNascimento || !role) {
      return new Response(JSON.stringify({ erro: 'Dados insuficientes para atualização.' }), { status: 400 });
    }

    // Se o usuário digitou uma nova senha, nós atualizamos a senha também. 
    // Se deixou em branco, mantemos a senha antiga.
    if (senha && senha.trim() !== '') {
      await sql`
        UPDATE usuarios 
        SET nome = ${nome}, sobrenome = ${sobrenome}, email = ${email}, senha = ${senha}, data_nascimento = ${dataNascimento}, role = ${role}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE usuarios 
        SET nome = ${nome}, sobrenome = ${sobrenome}, email = ${email}, data_nascimento = ${dataNascimento}, role = ${role}
        WHERE id = ${id}
      `;
    }

    return new Response(JSON.stringify({ mensagem: 'Usuário atualizado com sucesso!' }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ erro: error.message }), { status: 500 });
  }
}

// 🔴 MÉTODO DELETE: Excluir um usuário do banco pelo ID
export async function DELETE(request: Request) {
  const urlBanco = process.env['DATABASE_URL'];
  if (!urlBanco) return new Response(JSON.stringify({ erro: 'Banco não configurado.' }), { status: 500 });

  const sql = neon(urlBanco);
  try {
    // Pega o ID direto dos parâmetros da URL (Ex: /api/usuarios?id=5)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ erro: 'ID não informado.' }), { status: 400 });
    }

    await sql`DELETE FROM usuarios WHERE id = ${id}`;

    return new Response(JSON.stringify({ mensagem: 'Usuário removido com sucesso!' }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ erro: error.message }), { status: 500 });
  }
}