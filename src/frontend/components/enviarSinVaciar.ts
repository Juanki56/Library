"use client";

import { startTransition, type FormEvent } from "react";

// Con <form action={...}>, React vacía los campos al terminar el envío, incluso si el
// servidor devuelve un error: el usuario perdería lo escrito. Enviando desde onSubmit
// se conserva el contenido del formulario.
export function enviarSinVaciar(enviar: (datos: FormData) => void) {
  return (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => enviar(datos));
  };
}
