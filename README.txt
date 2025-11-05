View 1 - Vista frontal
View 2 - Vista de lado(esquerda)
View 3 - Vista de cima
View 4 - Vista axonométrica (constituída por uma rotação do eixo X e rotação do eixo Y)
(muda-se o ângulo com as setas)
View 0 - Colocar as 4 vistas todas ao mesmo tempo

usar lookAt()(gera matriz view, 1º args é localização da camera, 2º args é a direção da camera)


CHECKLIST ----
Tank Modelling

[x] Cabin rotates (a, d)

[x] Cannon rotates (w, s)

[x] Minimum 12 wheels

[?] Wheels rotate when tank moves (q, e) (não consigo confirmar se roda ou não)

[x] Minimum 18 primitives used

[x] Realistic movement limits applied (a nível do limite do canhão)


Views & Projections


[x] Single/multiple views toggle (0)

[x] Four camera presets (1–4)

[?] View 4: axonometric/oblique toggle (8)(incompleto falta incorporar os arrow keys)

[?] Parallel/perspective toggle (9)(talvez seja precisa que o fov interage com o zoom de momento o perspective não dá para dar zoom)

[ ] Parameters adjusted via arrow keys

[x] Zoom with mouse wheel (centred view)

[?] No distortion on window resize(no meu pc não distorcia, mas às vezes a alterar algo mínimo distorce tudo, é ter cuidade)


Scene Graph

[ ] Começar com o hardcode (como forma de perceber o que está a acontecer)

[ ] Internal + leaf nodes implemented

[ ] Correct transform order

[ ] Named nodes for control

[ ] Graph defined in JS or JSON


Ground + Extras


[?] Chequered ground plane at y = 0 (está checkered mas não se se está at y = 0, parece-me igual ao enunciado portanto idk)

[?] Tomatoes can be fired(eles não estão a sair do canhão quando o ângulo dele muda)

[ ] Creative add-ons (optional) (DRONE DRONE DRONE(se for bué torturoso manda-o po lixo mm))

BOA SORTE MPT GAMBALHÃO