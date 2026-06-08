import { neon } from '@neondatabase/serverless';

// 📥 ADICIONAR EXERCÍCIO (POST)
export async function POST(request: Request) {
  const urlBanco = process.env['DATABASE_URL'];
  if (!urlBanco) return new Response(JSON.stringify({ erro: 'Banco não configurado.' }), { status: 500 });

  const sql = neon(urlBanco);
  try {
    const corpo = await request.json();
    const { usuarioId, categoria, nomeExercicio, urlGif } = corpo;

    if (!usuarioId || !categoria || !nomeExercicio) {
      return new Response(JSON.stringify({ erro: 'Campos obrigatórios ausentes.' }), { status: 400 });
    }

    // Insere mapeando para camelCase no retorno do banco
    const resultado = await sql`
      INSERT INTO treinos (usuario_id, categoria, nome_exercicio, url_gif)
      VALUES (${Number(usuarioId)}, ${categoria.toLowerCase()}, ${nomeExercicio}, ${urlGif || null})
      RETURNING id, categoria, nome_exercicio AS "nomeExercicio", url_gif AS "urlGif"
    `;

    return new Response(JSON.stringify(resultado[0]), { status: 201 });
  } catch (error: any) {
    return new Response(JSON.stringify({ erro: error.message }), { status: 500 });
  }
}

// 📤 BUSCAR EXERCÍCIOS (GET)
export async function GET(request: Request) {
  const urlBanco = process.env['DATABASE_URL'];
  if (!urlBanco) return new Response(JSON.stringify({ erro: 'Banco não configurado.' }), { status: 500 });

  const { searchParams } = new URL(request.url);
  const usuarioIdRaw = searchParams.get('usuarioId');

  if (!usuarioIdRaw || usuarioIdRaw === 'null' || usuarioIdRaw === 'undefined') {
    return new Response(JSON.stringify({ erro: 'ID obrigatório.' }), { status: 400 });
  }

  const sql = neon(urlBanco);
  try {
    const usuarioId = Number(usuarioIdRaw);
    
    // 🛠️ Mapeamento com ALIAS (AS) para sincronizar perfeitamente com as propriedades do Angular
    const exercicios = await sql`
      SELECT 
        id, 
        categoria, 
        nome_exercicio AS "nomeExercicio", 
        url_gif AS "urlGif" 
      FROM treinos 
      WHERE usuario_id = ${usuarioId} 
      ORDER BY id ASC
    `;
    
    return new Response(JSON.stringify(exercicios), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ erro: error.message }), { status: 500 });
  }
}

// 🗑️ REMOVER EXERCÍCIO (DELETE)
export async function DELETE(request: Request) {
  const urlBanco = process.env['DATABASE_URL'];
  if (!urlBanco) return new Response(JSON.stringify({ erro: 'Banco não configurado.' }), { status: 500 });

  const { searchParams } = new URL(request.url);
  const idRaw = searchParams.get('id');

  if (!idRaw || idRaw === 'null' || idRaw === 'undefined') {
    return new Response(JSON.stringify({ erro: 'ID do exercício é obrigatório.' }), { status: 400 });
  }

  const sql = neon(urlBanco);
  try {
    const idExercicio = Number(idRaw);

    // 🛠️ Executa a deleção na tabela treinos baseada no ID gerado automaticamente pelo banco
    await sql`
      DELETE FROM treinos 
      WHERE id = ${idExercicio}
    `;

    return new Response(JSON.stringify({ mensagem: 'Exercício removido com sucesso!' }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ erro: error.message }), { status: 500 });
  }
}