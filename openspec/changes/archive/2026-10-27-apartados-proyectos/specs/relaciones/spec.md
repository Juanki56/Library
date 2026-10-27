# Spec Delta

## MODIFIED Requirements

### Requirement: Desvincular sin eliminar
**[Acordado]** Quitar un vínculo SHALL eliminar solo la relación, nunca el elemento. Desvincular un elemento de un proyecto SHALL quitarlo también de los apartados de ese proyecto.

#### Scenario: Quitar una nota de un proyecto
- **WHEN** el usuario desvincula una nota del proyecto "Comunismo"
- **THEN** la nota sigue existiendo y sigue vinculada a los demás espacios

#### Scenario: Desvincular quita de los apartados
- **WHEN** el usuario desvincula de «Estudiar filosofía» una nota que estaba en «Ética»
- **THEN** la nota deja de aparecer en «Ética» y sigue existiendo en la app
