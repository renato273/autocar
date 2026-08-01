// src/components/FuelLoadGuide.tsx
"use client";
import { HelpCircle } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function FuelLoadGuide() {
  const startTour = () => {
    const guide = driver({
      animate: true,
      showProgress: true,
      overlayOpacity: 0.55,
      overlayColor: "#07080d",
      smoothScroll: true,
      allowClose: true,
      stagePadding: 8,
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Entendido",
      progressText: "Paso {current} de {total}",
      steps: [
        {
          element: '[name="date"]',
          popover: {
            title: "Fecha de la Carga",
            description:
              "Indica cuándo cargaste combustible. Puedes registrar cargas atrasadas: el sistema usará la última carga anterior a esta fecha para calcular los kilómetros recorridos.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#prev-odometer",
          popover: {
            title: "Odómetro Anterior",
            description:
              "Se autocompleta con el odómetro de la última carga igual o anterior a la fecha elegida. Si no existe ninguna carga previa, muestra 0 y deberás ingresar los km manualmente.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[name="odometer"]',
          popover: {
            title: "Odómetro Actual",
            description:
              "Ingresa el kilometraje actual del vehículo. Al escribirlo, los kilómetros recorridos se calculan automáticamente restándole el odómetro anterior.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[name="kmDriven"]',
          popover: {
            title: "Kilómetros Recorridos",
            description:
              "Distancia recorrida desde la carga anterior. Se rellena solo al ingresar el odómetro, pero también puedes escribirlo manualmente.",
            side: "top",
            align: "start",
          },
        },
        {
          element: '[name="fuelType"]',
          popover: {
            title: "Tipo de Combustible",
            description:
              "Selecciona qué combustible cargaste: Nafta Común, Nafta Intermedia, Nafta Premium, Gasoil, GLP, etc.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[name="liters"]',
          popover: {
            title: "Litros Cargados",
            description:
              "Cantidad de litros que pusiste en el tanque. También se calcula automáticamente con la ingeniería inversa (total ÷ precio por litro).",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[name="totalPrice"]',
          popover: {
            title: "Precio Total Pagado (₲)",
            description:
              "El monto total que pagaste en la estación de servicio. Completa dos de los tres campos (total, precio/litro, litros) y el tercero se calcula solo.",
            side: "top",
            align: "start",
          },
        },
        {
          element: '[name="pricePerLiter"]',
          popover: {
            title: "Precio por Litro (₲/L)",
            description:
              "El costo de cada litro de combustible. Si ingresas el total y el precio/litro, los litros cargados se calculan automáticamente.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#calc-results",
          popover: {
            title: "Resultados Calculados",
            description:
              "En vivo verás los litros, el total o el precio por litro deducidos, más el rendimiento (km/L) y el consumo (L/100km) del vehículo.",
            side: "top",
            align: "start",
          },
        },
      ],
    });
    guide.drive();
  };

  return (
    <button type="button" onClick={startTour} className="btn btn-ghost">
      <HelpCircle size={18} /> ¿Cómo funciona?
    </button>
  );
}
