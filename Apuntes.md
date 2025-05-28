📋 Flujo de Gestión de Ausencias en Sistema de Colas
🔄 Algoritmo de Doble Oportunidad de Ausencias (DOA)
🔄 Primera Ausencia

Origen: Ticket en queue_tickets con estado CALLED o ATTENDING
Acción: Ejecutivo marca al cliente como ausente
Proceso:

Se crea nuevo registro en queue_tickets_absent
Estado automático: WAITING (listo para reintento)
Código automático: R + número original (ej: R015)
Se elimina OBLIGATORIAMENTE de queue_tickets

Resultado: Cliente pasa a cola de ausentes para segunda oportunidad

⚠️ Segunda Ausencia

Origen: Ticket en queue_tickets_absent con estado WAITING
Acción: Ejecutivo marca nuevamente como ausente
Proceso:

Se crea registro final en ticket_history
Estado final: ABSENT (ausencia definitiva)
Se calculan métricas de tiempo para análisis
Se elimina de queue_tickets_absent

Resultado: Cliente eliminado definitivamente del sistema

🎯 Características Clave

Transacciones atómicas garantizan consistencia
Un ticket existe solo en una tabla a la vez
Validaciones de permisos por módulo y ejecutivo
Preservación de datos históricos para análisis
Códigos únicos para identificar ausentes (R prefix)

📊 Estados del Flujo
queue_tickets (CALLED/ATTENDING)
↓ [1ra ausencia]
queue_tickets_absent (WAITING + R###)
↓ [2da ausencia]  
ticket_history (ABSENT - definitivo)
