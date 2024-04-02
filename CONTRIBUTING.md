# Guías de Contribución

## Modelo de Ramificación
Rama Principal (main): Esta rama refleja el estado listo para producción del proyecto. No se deben realizar cargas directas o cargas en esta rama.

Rama de Desarrollo (dev): Todo el trabajo de desarrollo debe basarse y fusionarse en esta rama. No se deben realizar cargas directamente en esta rama.

## Convención de Commits
Por favor, adhiérete a las siguientes convenciones al realizar commits:

### Mensajes de Commit

1. No comiences con mayúsculas, ni uses puntos finales.
2. Utiliza el modo imperativo (por ejemplo, "Corregir bug" en lugar de "Corrige bug" o "Corregido bug").
3. Se comienza con un verbo (por ejemplo, "fix", "add", "refactor", "docs").
4. Sé conciso y descriptivo. Explica claramente los cambios realizados en el commit.

### Nombramiento de Ramas

1. Utiliza nombres descriptivos para tus ramas, indicando el propósito de tus cambios.
2. Prefija las ramas de características con feature/, las ramas de corrección de errores con bugfix/, y cualquier otro prefijo relevante para mayor claridad.

# Proceso de Contribución
1. Haz un clone del repositorio
```sh
git clone ${repo url}
```

2. Crea una rama de características
```sh
git checkout -b feature/nombre-de-la-funcionalidad
```
> [!NOTE]
> Asegúrate de que tu rama de características se base en la rama dev y siempre vaya acompañada por un prefijo descriptivo. Esta lista de prefijos siempre está disponible en la documentación.

3. Realiza tus cambios y commits
```sh
git add .
git commit -m "fix: descripción del cambio"
```

4. Sube tus cambios a tu repositorio
```sh
git push origin feature/nombre-de-la-funcionalidad
```
**Es posible que te diga de usar `--set-upstream`, si es así, solo copia y pega el comando que te da.**

5. Crea un Pull Request

Ve al repositorio original y haz clic en el botón "Nuevo Pull Request".

Selecciona tu rama y proporciona un título descriptivo y un resumen de tus cambios.

Menciona cualquier problema o ticket relevante relacionado con tu PR.


# Proceso de Revisión

Tu PR será revisado por los Tech lead del proyecto. Prepárate para abordar cualquier comentario o inquietud.
Una vez aprobados, tus cambios se fusionarán en la rama dev.

# Limpieza

Después de que tus cambios se hayan fusionado, puedes eliminar tu rama de características.

# Notas Adicionales
## Calidad del Código

1. Sigue las convenciones de codificación y las pautas de estilo establecidas en el proyecto.
2. Escribe código claro y conciso con comentarios apropiados cuando sea necesario.
3. Utiliza nombres de variables y funciones descriptivos y significativos. 
4. Evita los nombres genéricos o ambiguos.
5. Mantén tu código limpio y ordenado. Elimina cualquier código muerto o comentarios innecesarios.
6. Utiliza funciones y métodos reutilizables y evita la duplicidad de código siempre que sea posible.
7. Usa [JSDOC](https://jsdoc.app/about-getting-started) para documentar tus funciones y métodos.

## Pruebas

1. Asegúrate de que tus cambios hayan sido probados exhaustivamente antes de crear un PR.
2. Escribe pruebas unitarias para nuevas características o correcciones de errores siempre que sea aplicable.
3. Asegúrate de que todas las pruebas existentes pasen antes de enviar tu PR.
## Comunicación

Si tienes alguna pregunta o necesitas aclaraciones sobre tus contribuciones, no dudes en comunicarte con los mantenedores del proyecto a través de discusiones de problemas u otros canales de comunicación proporcionados.