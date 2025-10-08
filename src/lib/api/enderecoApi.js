const BASE_URL = "http://localhost:8000/api/enderecos";

export async function listarEnderecos() {
  const res = await fetch(BASE_URL);
  return await res.json();
}

export async function criarEndereco(endereco) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(endereco),
  });
  return await res.json();
}
