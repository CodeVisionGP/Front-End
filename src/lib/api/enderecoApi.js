const BASE_URL = "http://localhost:8000/api/endereco";

// GET: buscar endereço de um usuário específico
export async function consultarEndereco(userId) {
  const res = await fetch(`${BASE_URL}/${userId}`);
  if (!res.ok) throw new Error("Endereço não encontrado");
  return await res.json();
}

// POST: criar endereço para um usuário
export async function criarEndereco(userId, endereco) {
  const res = await fetch(`${BASE_URL}/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(endereco),
  });
  if (!res.ok) throw new Error("Erro ao criar endereço");
  return await res.json();
}
