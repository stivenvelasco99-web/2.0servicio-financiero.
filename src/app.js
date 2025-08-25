// 🔧 app.js completo actualizado para CREDITO + DPF

// ==================== CREDITO ====================
document.getElementById('btn_calcular_credito').addEventListener('click', calcularCredito);

function calcularCredito() {
  const monto = parseFloat(document.getElementById('monto').value);
  const tasaAnual = parseFloat(document.getElementById('tasa').value) / 100;
  const plazo = parseInt(document.getElementById('plazo').value);
  const diaPago = parseInt(document.getElementById('dia_pago').value);
  const fechaLiquidacion = new Date(document.getElementById('fecha_liquidacion').value);

  const i_mensual = Math.pow(1 + tasaAnual, 1 / 12) - 1;
  const cuota = +(monto * i_mensual / (1 - Math.pow(1 + i_mensual, -plazo))).toFixed(2);

  let saldo = monto;
  let interesTotal = 0;
  let seguroTotal = 0;

  const tabla = [];
  for (let i = 1; i <= plazo; i++) {
    const interes = +(saldo * i_mensual).toFixed(2);
    const amortizacion = +(cuota - interes).toFixed(2);
    const seguro = +(saldo * 0.00058).toFixed(2);
    const pagoTotal = +(cuota + seguro).toFixed(2);
    const saldoFinal = +(saldo - amortizacion).toFixed(2);

    const fechaPago = new Date(fechaLiquidacion);
    fechaPago.setMonth(fechaPago.getMonth() + i);
    fechaPago.setDate(diaPago);

    tabla.push({
      cuota: i,
      fecha: fechaPago.toLocaleDateString(),
      interes,
      amortizacion,
      saldoInicial: saldo,
      saldoFinal,
      seguro,
      pagoTotal
    });

    interesTotal += interes;
    seguroTotal += seguro;
    saldo = saldoFinal;
  }

  // Mostrar tabla y resumen
  mostrarTablaCredito(tabla);
  const solca = +(monto * 0.005).toFixed(2);
  const fondo = +(monto * 0.03).toFixed(2);
  const recibir = +(monto - solca - fondo).toFixed(2);

  document.getElementById('resumen_interes').innerText = "$" + interesTotal.toFixed(2);
  document.getElementById('resumen_capital').innerText = "$" + monto.toFixed(2);
  document.getElementById('resumen_seguro').innerText = "$" + seguroTotal.toFixed(2);
  document.getElementById('resumen_solca').innerText = "$" + solca.toFixed(2);
  document.getElementById('resumen_fondo').innerText = "$" + fondo.toFixed(2);
  document.getElementById('resumen_recibir').innerText = "$" + recibir.toFixed(2);
  document.getElementById('resumen_total').innerText = "$" + (interesTotal + monto + seguroTotal).toFixed(2);
}

function mostrarTablaCredito(tabla) {
  const contenedor = document.getElementById('tabla_credito');
  contenedor.innerHTML = '';
  tabla.forEach(row => {
    contenedor.innerHTML += `<tr>
      <td>${row.cuota}</td>
      <td>${row.fecha}</td>
      <td>$${row.saldoInicial.toFixed(2)}</td>
      <td>$${row.interes.toFixed(2)}</td>
      <td>$${row.amortizacion.toFixed(2)}</td>
      <td>$${row.saldoFinal.toFixed(2)}</td>
      <td>$${row.seguro.toFixed(2)}</td>
      <td>$${row.pagoTotal.toFixed(2)}</td>
    </tr>`;
  });
}

// ==================== DPF ====================
document.getElementById('fecha_inicio').addEventListener('change', calcularDiasDPF);
document.getElementById('fecha_fin').addEventListener('change', calcularDiasDPF);
document.getElementById('btn_calcular_dpf').addEventListener('click', calcularDPF);

let diasDPF = 0;

function calcularDiasDPF() {
  const inicio = new Date(document.getElementById('fecha_inicio').value);
  const fin = new Date(document.getElementById('fecha_fin').value);
  if (inicio && fin && fin > inicio) {
    diasDPF = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));
    document.getElementById('dpf_dias').innerText = diasDPF + ' días';
  }
}

function calcularDPF() {
  const monto = parseFloat(document.getElementById('dpf_monto').value);
  const tasa = parseFloat(document.getElementById('dpf_tasa').value) / 100;
  const modalidad = document.querySelector('input[name="modalidad"]:checked').value;
  const tabla = [];

  if (modalidad === 'vencimiento') {
    const interes = +(monto * (Math.pow(1 + tasa, diasDPF / 365) - 1)).toFixed(2);
    tabla.push({
      n: 1,
      fecha_pago: document.getElementById('fecha_fin').value,
      dias: diasDPF,
      capital: monto,
      interes,
      total: interes
    });
  } else {
    const pagos = Math.floor(diasDPF / 30);
    const interesMensual = +(monto * (tasa / 12)).toFixed(2);
    for (let i = 1; i <= pagos; i++) {
      const fechaPago = new Date(document.getElementById('fecha_inicio').value);
      fechaPago.setDate(fechaPago.getDate() + (i * 30));
      tabla.push({
        n: i,
        fecha_pago: fechaPago.toLocaleDateString(),
        dias: 30,
        capital: monto,
        interes: interesMensual,
        total: interesMensual
      });
    }
  }
  mostrarTablaDPF(tabla);
}

function mostrarTablaDPF(tabla) {
  const contenedor = document.getElementById('tabla_dpf');
  contenedor.innerHTML = '';
  tabla.forEach(row => {
    contenedor.innerHTML += `<tr>
      <td>${row.n}</td>
      <td>${row.fecha_pago}</td>
      <td>${row.dias}</td>
      <td>$${row.capital.toFixed(2)}</td>
      <td>$${row.interes.toFixed(2)}</td>
      <td>$${row.total.toFixed(2)}</td>
    </tr>`;
  });
}
