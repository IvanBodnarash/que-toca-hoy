/*
 * Nota importante sobre el manejo del PIN:
 * ----------------------------------------
 * - Al crear un grupo, ahora el PIN se genera automáticamente (aleatorio y seguro).
 * - Se almacena de dos formas:
 *     1) `pin` → hash con bcrypt (para verificar la contraseña sin exponerla)
 *     2) `pinEncrypted` → cifrado AES-256-GCM (para poder mostrar el PIN en caso de ser necesario)
 * - Esto asegura que:
 *     • Nunca se guarda el PIN en texto plano.
 *     • Se puede validar el PIN en `join` usando el hash.
 *     • Se puede recuperar el PIN para mostrarlo al usuario si es necesario (desencriptando).
 */