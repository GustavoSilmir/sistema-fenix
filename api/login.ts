import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  const urlBanco = process.env['DATABASE_URL'];
  
  if (!urlBanco) {
    return new Response(JSON.stringify({ erro: 'Variável DATABASE_URL não configurada.' }), { status: 500 });
  }

  const sql = neon(urlBanco);
  
  try {
    const corpo = await request.json();
    const { email, senha } = corpo;

    if (!email || !senha) {
      return new Response(JSON.stringify({ erro: 'E-mail e senha são obrigatórios.' }), { status: 400 });
    }

    // Buscando os dados na Neon
    const resultado = await sql`
      SELECT id, nome, sobrenome, email, senha, role 
      FROM usuarios 
      WHERE email = ${email} 
      LIMIT 1
    `;

    if (resultado.length === 0) {
      return new Response(JSON.stringify({ erro: 'Usuário ou senha incorretos.' }), { status: 401 });
    }

    // 🌟 Mapeando explicitamente como 'any' para evitar que o interpretador
    // ignore as propriedades na hora de gerar o JSON de resposta.
    const usuario = resultado[0] as any;

    // Verificação da senha
    if (usuario.senha !== senha) {
      return new Response(JSON.stringify({ erro: 'Usuário ou senha incorretos.' }), { status: 401 });
    }

    // 🚀 Retorno blindado: Garantia total de que as chaves vão existir no JSON recebido pelo Angular
    const respostaDados = {
      id: Number(usuario.id), // Força virar número puro
      nome: String(usuario.nome),
      sobrenome: String(usuario.sobrenome),
      email: String(usuario.email),
      role: String(usuario.role)
    };

    return new Response(JSON.stringify(respostaDados), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ erro: error.message }), { status: 500 });
  }
}