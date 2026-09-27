// Utilitários para lidar com datas no formato brasileiro (DD/MM/AAAA)
// e converter para o formato ISO (AAAA-MM-DD) usado pelo calendário.

export function dataValida(dataBR) {
  if (!dataBR) return false;
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dataBR.match(regex);
  if (!match) return false;

  const dia = parseInt(match[1], 10);
  const mes = parseInt(match[2], 10);
  const ano = parseInt(match[3], 10);

  if (mes < 1 || mes > 12) return false;
  const diasNoMes = new Date(ano, mes, 0).getDate();
  if (dia < 1 || dia > diasNoMes) return false;

  return true;
}

export function paraISO(dataBR) {
  if (!dataValida(dataBR)) return null;
  const [dia, mes, ano] = dataBR.split("/");
  return `${ano}-${mes}-${dia}`;
}

export function isoParaBR(dataISO) {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function hojeBR() {
  return new Date().toLocaleDateString("pt-BR");
}

export function hojeISO() {
  return new Date().toISOString().split("T")[0];
}

// Aplica a máscara DD/MM/AAAA enquanto o usuário digita.
export function aplicarMascaraData(texto, textoAnterior) {
  const apenasNumeros = texto.replace(/[^0-9]/g, "").slice(0, 8);

  let resultado = "";
  for (let i = 0; i < apenasNumeros.length; i++) {
    if (i === 2 || i === 4) resultado += "/";
    resultado += apenasNumeros[i];
  }
  return resultado;
}
