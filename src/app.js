// Utilidades
const fmt = n => Number(n).toLocaleString('es-EC',{minimumFractionDigits:2,maximumFractionDigits:2});
const mrateFromEA = ea => Math.pow(1 + ea, 1/12) - 1;

// Render helpers
function renderTable(selector, headers, rows){
  const thead = document.querySelector(`${selector} thead`);
  const tbody = document.querySelector(`${selector} tbody`);
  thead.innerHTML = `<tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr>`;
  tbody.innerHTML = rows.map(r=>`<tr>${r.map((x,i)=>`<td style="text-align:${i===0?'left':'right'}">${typeof x==="number"?fmt(x):x}</td>`).join("")}</tr>`).join("");
}

// ----- Amortización -----
let amRows = [];
document.getElementById('am_calc').addEventListener('click', () => {
  const P = +document.getElementById('am_monto').value || 0;
  const n = +document.getElementById('am_plazo').value || 0;
  const ea = (+document.getElementById('am_tasa_ea').value || 0)/100;
  const imManual = (+document.getElementById('am_tasa_m').value || 0)/100;
  const metodo = document.getElementById('am_metodo').value;
  const seguro = +document.getElementById('am_seguro').value || 0;

  const i = imManual>0 ? imManual : mrateFromEA(ea);
  document.getElementById('am_info').textContent = `i mensual: ${(i*100).toFixed(4)}%`;

  let saldo = P;
  amRows = [];
  let totalInt = 0, totalAm = 0, totalCuota = 0, totalSeguro = 0;

  if(metodo === 'frances'){
    const factor = Math.pow(1+i, n);
    const Cbas = i>0 ? P * (i*factor/(factor-1)) : P/n;
    for(let k=1; k<=n; k++){
      const interes = saldo * i;
      const amort = Cbas - interes;
      saldo = Math.max(0, saldo - amort);
      const cuota = Cbas + seguro;
      amRows.push([k, saldo+amort, interes, Cbas, amort, saldo, seguro, cuota]);
      totalInt += interes; totalAm += amort; totalCuota += cuota; totalSeguro += seguro;
    }
  } else {
    const amortFija = P / n;
    for(let k=1; k<=n; k++){
      const interes = saldo * i;
      saldo = Math.max(0, saldo - amortFija);
      const cuota = amortFija + interes + seguro;
      amRows.push([k, saldo+amortFija, interes, amortFija+interes, amortFija, saldo, seguro, cuota]);
      totalInt += interes; totalAm += amortFija; totalCuota += cuota; totalSeguro += seguro;
    }
  }

  renderTable('#am_tabla',
    ["Mes","Saldo Inicial","Interés","Cuota (sin seg.)","Amortización","Saldo Final","Seguro","Pago Total"],
    amRows
  );

  document.getElementById('am_totales').innerHTML =
    `Intereses: <b>$${fmt(totalInt)}</b> · Amortizado: <b>$${fmt(totalAm)}</b> · Seguros: <b>$${fmt(totalSeguro)}</b> · Total pagado: <b>$${fmt(totalCuota)}</b>`;

  document.getElementById('am_pdf').disabled = false;
});

document.getElementById('am_pdf').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:'pt', format:'a4'});

  const P = +document.getElementById('am_monto').value || 0;
  const n = +document.getElementById('am_plazo').value || 0;
  const ea = (+document.getElementById('am_tasa_ea').value || 0);
  const im = (+document.getElementById('am_tasa_m').value || 0);
  const metodo = document.getElementById('am_metodo').value;
  const seguro = +document.getElementById('am_seguro').value || 0;
  const iTxt = document.getElementById('am_info').textContent || "";

  doc.setFontSize(14);
  doc.text("Servicio Financiero – Tabla de amortización", 40, 40);
  doc.setFontSize(10);
  doc.text(`Monto: $${fmt(P)}  ·  Plazo: ${n} meses  ·  EA: ${ea}%  ·  i mensual: ${iTxt.replace('i mensual: ','')}`, 40, 60);
  doc.text(`Método: ${metodo.toUpperCase()}  ·  Seguro mensual: $${fmt(seguro)}`, 40, 75);

  const head = [["Mes","Saldo Inicial","Interés","Cuota s/seg.","Amortización","Saldo Final","Seguro","Pago Total"]];
  const body = amRows.map(r => [
    r[0], fmt(r[1]), fmt(r[2]), fmt(r[3]), fmt(r[4]), fmt(r[5]), fmt(r[6]), fmt(r[7])
  ]);

  doc.autoTable({
    head, body,
    startY: 95,
    styles: { fontSize: 8, cellPadding: 3, halign: 'right' },
    headStyles: { halign: 'center' },
    columnStyles: { 0: { halign: 'center' } }
  });

  doc.save("amortizacion.pdf");
});

// ----- DPF -----
let dpRows = [];
document.getElementById('dp_calc').addEventListener('click', () => {
  const P = +document.getElementById('dp_monto').value || 0;
  const n = +document.getElementById('dp_plazo').value || 0;
  const ea = (+document.getElementById('dp_tasa_ea').value || 0)/100;
  const modalidad = document.getElementById('dp_modalidad').value;
  const i = mrateFromEA(ea);

  document.getElementById('dp_info').textContent = `i mensual: ${(i*100).toFixed(4)}%`;

  dpRows = [];
  let totalInt = 0;

  if(modalidad==="mensual"){
    const interesMes = P * i;
    for(let k=1;k<=n;k++){
      dpRows.push([k, P, interesMes, (k===n?P:0), P]);
      totalInt += interesMes;
    }
  } else {
    let saldo = P;
    for(let k=1;k<=n;k++){
      const interes = saldo * i;
      saldo += interes;
      dpRows.push([k, (k===1?P:dpRows[k-2][4]), interes, (k===n?saldo:0), saldo]);
      totalInt += interes;
    }
  }

  renderTable('#dp_tabla',
    ["Mes","Capital Base","Interés","Pago de Capital","Saldo/Valor"],
    dpRows
  );

  const valorFinal = dpRows[dpRows.length-1][3] || dpRows[dpRows.length-1][4];
  document.getElementById('dp_totales').innerHTML =
    `Intereses totales: <b>$${fmt(totalInt)}</b> · Valor final a recibir: <b>$${fmt(valorFinal)}</b>`;

  document.getElementById('dp_pdf').disabled = false;
});

document.getElementById('dp_pdf').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:'pt', format:'a4'});

  const P = +document.getElementById('dp_monto').value || 0;
  const n = +document.getElementById('dp_plazo').value || 0;
  const ea = (+document.getElementById('dp_tasa_ea').value || 0);
  const modalidad = document.getElementById('dp_modalidad').value;
  const iTxt = document.getElementById('dp_info').textContent || "";

  doc.setFontSize(14);
  doc.text("Servicio Financiero – DPF", 40, 40);
  doc.setFontSize(10);
  doc.text(`Monto: $${fmt(P)}  ·  Plazo: ${n} meses  ·  EA: ${ea}%  ·  i mensual: ${iTxt.replace('i mensual: ','')}`, 40, 60);
  doc.text(`Modalidad: ${modalidad.toUpperCase()}`, 40, 75);

  const head = [["Mes","Capital Base","Interés","Pago Capital","Saldo/Valor"]];
  const body = dpRows.map(r => [r[0], fmt(r[1]), fmt(r[2]), fmt(r[3]), fmt(r[4])]);

  doc.autoTable({
    head, body,
    startY: 95,
    styles: { fontSize: 8, cellPadding: 3, halign: 'right' },
    headStyles: { halign: 'center' },
    columnStyles: { 0: { halign: 'center' } }
  });

  doc.save("dpf.pdf");
});
