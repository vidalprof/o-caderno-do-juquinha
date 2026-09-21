/* ============================================================
   ESQUELETO DA FOLHA VIVA — as folhas.

   ⚠️ ESTE ARQUIVO É A CASCA. As folhas (`f01`, `f02`, …) se escrevem abaixo, e
   cada uma nasce de um VERBO impresso numa folha de papel colhida. O crivo —
   comando VERBATIM e veredito de cada uma das trinta — vai em
   `_sequencias/POTE-<assunto>.md`, e é DELE que sai o roteiro.

   ⚠️ A POSIÇÃO É A IDENTIDADE: a folha da posição 7 usa o pote `p7`, grava os
      ids `n7_*` e fala `p7enun`. Não há segunda lista para desencontrar.

   O QUE JÁ VEM PRONTO AQUI (clonar destas peças, não reescrever):
     · `faixa` · `enunciado` · `item` · `fechaItem` · `nomeSecreto`
     · `opcoes` (a fileira de escolhas, com arrastar de brinde)
     · `puxavel` (arrastar com mouse, dedo e caneta — três lições pagas dentro)
     · `gavetas` (classificar em colunas, nas duas portas)
     · `montaLigar` (ligar com linha curva)
     · o teclado (`abreCruz`/`digitaCruz`/`confereCruz`/`rolaParaCruz`)
     · navegação, boletim, relatório do professor, dossiê, retomar 55 min
   ============================================================ */

var livro = document.getElementById("livro"), PAGEL = [], TIRAS = [];
/* ⚠️⚠️ AS FOLHAS DE LIGAR SE DECLARAM AQUI, e o número errado quebra DUAS
   folhas de uma vez — medido no `_rima1`, que estava no ar: a folha que liga
   NUNCA fechava (a criança ligava tudo e continuava faltando) e a folha
   apontada por engano FECHAVA SOZINHA, sem ninguém tocar nela. São as únicas
   cujos ids não nascem de `n<pi>_`, e sim dentro do `montaLigar`
   (`l<pi>g<i>_<chave>`). Conferir com `node _qa/conta_folha.js <pasta>`. */
var LIGAR = [11];
/* a cor da faixa por BLOCO da escada, não por folha: a criança vê que o assunto
   mudou. Uma entrada por folha, de c1 a c5. */
var CORES = ["c1", "c1", "c1", "c2", "c2", "c2", "c3", "c3", "c3", "c3", "c3", "c4", "c4", "c4", "c4", "c5", "c5", "c5", "c5", "c5", "c5", "c1", "c1", "c1", "c1", "c2", "c2", "c2", "c2", "c2", "c3", "c3", "c3", "c3", "c3"];


function faixa(d, i, titulo){ d.appendChild(el("div", "faixa", '<div class="num">' + i + '</div><h2>' + titulo + '</h2>')); }
function aoAbrir(d, fn){ if(!d._aoAbrir) d._aoAbrir = []; d._aoAbrir.push(fn); }
/* ---------- O ALTO-FALANTE ----------
   Regra da casa: tudo o que a criança PRECISA LER tem que poder ser OUVIDO.
   O desenho do botão é CSS puro: nada de emoji (vira quadradinho nos PCs da
   escola). */
function botaoSom(rot, aoTocar, cls){
  var b = el("button", cls || "som");
  b.innerHTML = '<i class="cone"></i><i class="onda o1"></i><i class="onda o2"></i>';
  b.setAttribute("aria-label", rot || "Ouvir");
  b.onclick = function(ev){ ev.stopPropagation(); sPasso(); aoTocar(); };
  return b;
}
function enunciado(d, pi, texto, chave){
  var cx = el("div", "enunlin");
  cx.appendChild(el("div", "enun", texto));
  cx.appendChild(botaoSom("Ouvir o que a folha pede", function(){ falar(chave); }));
  d.appendChild(cx);
}
function item(n){ return el("div", "item", n ? '<span class="n">' + n + '.</span>' : ""); }
function fechaItem(d, box, id){
  if(ST.resp[id]) box.className = "item feito";
  box.setAttribute("data-qa", "item-" + id);
  d.appendChild(box);
}
/* ⚠️ A RESPOSTA NÃO PODE APARECER ANTES DE A CRIANÇA RESPONDER. A palavra não
   some: fica INVISÍVEL (`visibility`, para o espaço ficar guardado e a folha não
   pular) e aparece no instante do acerto. É o que o `_qa/resposta_impressa.py`
   mede. */
function nomeSecreto(txt, id){
  var b = el("b", "segredo" + (ST.resp[id] ? " revelado" : ""), txt);
  b.setAttribute("data-nome", id);
  return b;
}
function chaveQuadro(w){ return String(w).toLowerCase().replace(/[^a-z]/g, ""); }

/* ---------- fileira de opções (a peça que mais se repete) ----------
   `soltarEm` (opcional) liga o ARRASTAR: a criança pode puxar a peça até o
   alvo em vez de só tocar nela. AS DUAS PORTAS, SEMPRE — no PC da escola ela
   usa o mouse e arrastar é o gesto natural; no celular, tocar é. */
function opcoes(pai, pi, id, lista, certa, cls, falaCerto, falaDica, aoAcertar, soltarEm){
  registra(id, pi, certa);
  var box = el("div", "ops"), feito = !!ST.resp[id];
  function responde(o, b){
    if(ST.resp[id]) return;
    sPasso(); if(o.fala) falar(o.fala);
    if(o.v === certa){
      b.className = "op" + (cls ? " " + cls : "") + " certa";
      if(aoAcertar) aoAcertar(b);
      setTimeout(function(){ acertou(id, falaCerto); }, aoAcertar ? 620 : 240);
    } else {
      b.className = "op" + (cls ? " " + cls : "") + " erro";
      setTimeout(function(){ b.className = "op" + (cls ? " " + cls : ""); }, 500);
      errou(id, falaDica);
    }
  }
  lista.forEach(function(o){
    var b = el("button", "op" + (cls ? " " + cls : "") + (feito && o.v === certa ? " certa" : ""), o.rot);
    b.setAttribute("data-qa", "op-" + id + "-" + o.v);
    b.setAttribute("aria-label", o.aria || o.v);
    b.onclick = function(){ if(b._arrastou){ b._arrastou = false; return; } responde(o, b); };
    if(soltarEm) puxavel(b, soltarEm, function(){ responde(o, b); });
    /* ⚠️ O ALTO-FALANTE DA RESPOSTA, e ele é DISCRETO e vem ANTES da escolha.
       Pergunta do Marcos (20/set/2026): *"a atividade tem áudio para ajudar os
       que não sabem ler? O alto-falante discreto para clicar caso o estudante
       queira ouvir"*. A resposta era NÃO: a opção tinha `fala`, mas o motor só
       a tocava DEPOIS do clique — ou seja, a criança tinha de ESCOLHER para
       ouvir, e aí já tinha respondido. O portão `1o` media a metade errada
       (cobrava o campo `fala` existir, não a criança poder ouvir antes).
       ⚠️ Botão IRMÃO, nunca dentro do outro: botão dentro de botão é HTML
       inválido e o clique vaza para a resposta. O `botaoSom` já faz
       `stopPropagation`. */
    if(o.fala){
      var w = el("div", "opw" + (cls && cls.indexOf("frase") > -1 ? " larga" : ""));
      w.appendChild(b);
      w.appendChild(botaoSom("Ouvir esta resposta",
        (function(f){ return function(){ falar(f); }; })(o.fala), "som somop"));
      box.appendChild(w);
    } else {
      box.appendChild(b);
    }
  });
  pai.appendChild(box);
}

/* ---------- PUXAR uma peça até um alvo (mouse, dedo e caneta) ----------
   ⚠️ Pointer Events e não mouse+touch separados: no celular o navegador dispara
   eventos de mouse FANTASMA depois do toque, e foi assim que o arrastar já
   quebrou duas vezes nesta casa.
   ⚠️ E nada de `preventDefault` no início: isso mataria o toque. Só depois de o
   dedo ANDAR 8 px é que vira arrasto — antes disso continua sendo um toque
   normal e o `onclick` responde igual. */
var PUXA = null;

function puxavel(bt, alvos, aoSoltar){
  if(!alvos.push) alvos = [alvos];
  bt.style.touchAction = "none";
  bt.addEventListener("pointerdown", function(ev){
    if(ev.button && ev.button !== 0) return;
    PUXA = {bt: bt, alvos: alvos, aoSoltar: aoSoltar,
            x0: ev.clientX, y0: ev.clientY,
            lx: ev.clientX, ly: ev.clientY,
            andando: false, fantasma: null};
  });
}
/* ⚠️⚠️ TRÊS LIÇÕES PAGAS AQUI, e nenhuma delas dava erro na tela — o arrasto
   simplesmente não acontecia:
   1. ouvir o `pointermove` no PRÓPRIO botão: só o primeiro movimento chegava.
      O padrão certo é ouvir no DOCUMENTO — o dedo precisa poder SAIR de cima da
      peça, que é justamente o que ele faz ao levá-la.
   2. o navegador FUNDE os movimentos: num teste com oito passos chegou UM
      `pointermove`. Quem manda é a SOLTURA, não a contagem de movimentos.
   3. o `pointercancel` chega ANTES do `pointerup` e vem com clientX/clientY
      = 0,0 — quem usasse a coordenada dele concluiria que a criança soltou no
      canto da tela. Por isso o último ponto REAL fica guardado. */
function _puxaAnda(ev){
  var P = PUXA; if(!P) return;
  P.lx = ev.clientX; P.ly = ev.clientY;
  var dx = ev.clientX - P.x0, dy = ev.clientY - P.y0;
  if(!P.andando){
    if(dx * dx + dy * dy < 64) return;
    P.andando = true; P.bt._arrastou = true;
    var f = P.bt.cloneNode(true);
    f.className = "fantasma " + P.bt.className;
    var r = P.bt.getBoundingClientRect();
    f.style.width = r.width + "px"; f.style.height = r.height + "px";
    f._ox = r.left; f._oy = r.top;
    document.body.appendChild(f); P.fantasma = f;
    P.bt.className = P.bt.className + " puxada";
  }
  if(ev.cancelable) ev.preventDefault();
  P.fantasma.style.left = (P.fantasma._ox + dx) + "px";
  P.fantasma.style.top = (P.fantasma._oy + dy) + "px";
  P.alvos.forEach(function(a){
    a.className = a.className.replace(/ ?perto/, "") + (sobre(ev, a) ? " perto" : "");
  });
}
function _puxaSolta(ev){
  var P = PUXA; if(!P) return;
  PUXA = null;
  P.alvos.forEach(function(a){ a.className = a.className.replace(/ ?perto/, ""); });
  P.bt.className = P.bt.className.replace(/ ?puxada/, "");
  if(P.fantasma && P.fantasma.parentNode) P.fantasma.parentNode.removeChild(P.fantasma);
  var px = ev.clientX, py = ev.clientY;
  if(!px && !py){ px = P.lx; py = P.ly; }
  var onde = {clientX: px, clientY: py};
  var andou = (px - P.x0) * (px - P.x0) + (py - P.y0) * (py - P.y0) >= 64;
  if(!andou) return;
  P.bt._arrastou = true;
  var i;
  for(i = 0; i < P.alvos.length; i++){
    if(sobre(onde, P.alvos[i])){ P.aoSoltar(P.alvos[i], i); break; }
  }
  setTimeout(function(){ P.bt._arrastou = false; }, 60);
}
document.addEventListener("dragstart", function(ev){ ev.preventDefault(); });
document.addEventListener("pointermove", _puxaAnda);
document.addEventListener("pointerup", _puxaSolta);
document.addEventListener("pointercancel", _puxaSolta);
function sobre(ev, alvo){
  var r = alvo.getBoundingClientRect(), m = 14;
  return ev.clientX >= r.left - m && ev.clientX <= r.right + m &&
         ev.clientY >= r.top - m && ev.clientY <= r.bottom + m;
}

function monta(){
  livro.innerHTML = ""; PAGEL = []; RESP = {}; TIRAS = [];
  /* ⚠️ UMA ENTRADA POR FOLHA, na ordem, começando pela capa `f0`. */
  var caps = [f0, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15, f16, f17, f18, f19, f20, f21, f22, f23, f24, f25, f26, f27, f28, f29, f30, f31, f32, f33, f34, f35], i;
  for(i = 0; i < caps.length; i++){
    var d = el("div", "pagina" + (i > 0 ? " " + CORES[i - 1] : "")); d.setAttribute("data-pag", i);
    caps[i](d, i);
    if(i > 0) d.appendChild(el("div", "carimbo", "FOLHA<br>PRONTA"));
    livro.appendChild(d); PAGEL.push(d);
  }
}

/* ---------- capa ----------
   A capa não é enfeite: é a primeira coisa que a criança vê, e é ela que diz
   "isto aqui é um lugar bom". O tema sai do PROBLEMA do caderno.
   ⚠️ CAPA CLONADA = TROCAR A CENA, SEMPRE. Numa capa herdada desta casa ficou um
      `img()` de outra atividade: o app abria com um quadradinho vazio e um 404
      no console, e nenhum portão de texto viu. */
function f0(d){
  /* ⭐ A CAPA DESTE CADERNO — e a cena É o assunto (portão 0b11).
     Uma tira de papel pautado com a frase do Juquinha GRUDADA; as palavras
     abrem devagar até os espaços aparecerem, e fecham de novo. A criança vê o
     problema antes de ler o título — o problema primeiro, o conceito por
     último (Portão 0 da filosofia da casa). */
  var c = el("div", "capa"), nome = "Aprendendo a separar as palavras na frase e no texto", k, letras = "";
  nome.split(" ").forEach(function(pal, w){
    var s = "";
    for(k = 0; k < pal.length; k++) s += '<span class="lt">' + pal.charAt(k) + '</span>';
    letras += (w ? '<span class="esp"></span>' : '') + '<span class="tpal">' + s + '</span>';
  });
  var pals = ["A", "CANOA", "VIROU"], fr = "";
  for(k = 0; k < pals.length; k++)
    fr += '<span class="jqpal" style="-webkit-animation-delay:' + (k * .18) +
          's;animation-delay:' + (k * .18) + 's">' + pals[k] + '</span>';
  c.innerHTML =
    '<div class="ceu"></div>' +
    '<h1 class="titu">' + letras + '</h1>' +
    '<div class="sub">Língua Portuguesa &middot; 2º ano &middot; 35 folhas para separar as palavras</div>' +
    '<div class="cena"><div class="jqtira"><div class="jqfr">' + fr + '</div></div></div>' +
    '<div class="chamada">Escreva o seu nome ali embaixo e toque em <b>Começar</b>.</div>';
  d.appendChild(c);
}

function gavetas(d, pi, gk, pede){
  faixa(d, pi, NOMES[pi - 1]);
  var G = GAV[gk];
  enunciado(d, pi, pede, "p" + pi + "enun");
  var cols = el("div", "colunas"), caixas = {}, listaC = [];
  G.cols.forEach(function(C){
    var c = el("div", "coluna");
    var t = el("div", "ctit", C.n);
    t.setAttribute("data-alvo", "1");
    /* ⚠️ o alvo é COMPARTILHADO pela folha inteira, então ele se declara no
       nível da página — e com o número da folha no nome, porque as 22 folhas
       moram no mesmo HTML e o jogador da banca busca por `document.querySelector`. */
    c.setAttribute("data-qa", "alvo-gav" + pi + "_" + C.k);
    t.appendChild(botaoSom("Ouvir a regra desta gaveta", function(){ falar("gav_" + gk + "_" + C.k); }));
    c.appendChild(t);
    var dentro = el("div", "cdentro");
    c.appendChild(dentro);
    c._v = C.k; c._dentro = dentro;
    caixas[C.k] = c; listaC.push(c);
    cols.appendChild(c);
  });
  d.appendChild(cols);
  var banco = el("div", "figbanco"), marcada = null;
  ST.folha["p" + pi].forEach(function(n, i){
    var P = G.pal[n], id = "n" + pi + "_" + i;
    registra(id, pi, ">gav" + pi + "_" + P.c);
    var b = el("button", "op pal" + (ST.resp[id] ? " usada" : ""), P.p);
    b.setAttribute("aria-label", P.p);
    b.setAttribute("data-qa", "item-" + id);
    /* a palavra escrita é a PEÇA que a criança pega, não a resposta entregue */
    b.setAttribute("data-alvo", "1");
    if(ST.resp[id]) caixas[P.c]._dentro.appendChild(el("span", "fdentro", P.p));
    function larga(col){
      if(ST.resp[id]) return;
      if(col._v === P.c){
        b.className = "op pal usada";
        col._dentro.appendChild(el("span", "fdentro", P.p));
        if(marcada === b) marcada = null;
        acertou(id, "certo" + pi + "_" + n);
      } else {
        col.className = "coluna erro";
        setTimeout(function(){ col.className = "coluna"; }, 500);
        errou(id, "dica" + pi + "_" + n);
      }
    }
    b._larga = larga;
    b.onclick = function(){
      if(b._arrastou){ b._arrastou = false; return; }
      if(ST.resp[id]) return;
      sPasso(); falar("diz2_" + gk + "_" + n);
      if(marcada === b){ b.className = "op pal"; marcada = null; return; }
      if(marcada) marcada.className = "op pal";
      b.className = "op pal marcada"; marcada = b;
    };
    puxavel(b, listaC, function(col){ larga(col); });
    banco.appendChild(b);
  });
  listaC.forEach(function(col){
    col.onclick = function(){
      if(!marcada){ sPasso(); falar("toque_palavra"); return; }
      marcada._larga(col);
    };
  });
  d.appendChild(banco);
}

/* ============================================================
   AS FOLHAS — escrever daqui para baixo, uma função por folha.

   O MOLDE de uma folha de escolher:

     function f01(d, pi){
       faixa(d, pi, NOMES[pi - 1]);
       enunciado(d, pi, "O que a criança tem de fazer.", "p" + pi + "enun");
       ST.folha["p" + pi].forEach(function(k, i){
         var D = MEUDADO[k], id = "n" + pi + "_" + i, box = item(i + 1);
         // … desenhar a peça …
         opcoes(box, pi, id, lista, certa, "pal",
                "certo" + pi + "_" + k, "dica" + pi + "_" + k);
         fechaItem(d, box, id);
       });
     }

   ⚠️ E CADA PEÇA TEM DE SER ALCANÇÁVEL PELO JOGADOR DA BANCA, senão a folha sai
      como dívida e ninguém a mede. Os contratos, em `_qa/joga_folha.js`:
        `esc-<id>`            → campo de teclado
        `op-<id>-<valor>`     → uma escolha
        `item-<id>` + `>gav`  → pegar a peça e largar na gaveta
        `pinta-<id>-<x>` + `data-lapis="<x>"` e o estojo `lapis-<x>` → pintar
        `cp-<id>-a` / `cp-<id>-z` → as duas pontas da palavra no caça-palavras
        `conferir-<id>`       → marque vários e confirme
   ============================================================ */
/* ---------- o teclado da palavra: uma por vez, letra a letra ----------
   ⚠️ UMA PEÇA SÓ PARA A CRUZADINHA (22) E PARA O REESCREVA (19). As duas
   escrevem palavra letra a letra; escrever dois teclados seria arrumar lugar
   para um segundo defeito. O que muda entre elas é só o rótulo da tarja —
   daí o `E.rot`. */
var CRUZ = null;
/* ---------- ROLAR A PALAVRA PARA CIMA DO TECLADO ----------
   ⚠️⚠️ O TECLADO TAPAVA A ATIVIDADE, e o Marcos viu no celular (15/set/2026):
      *"ele preenche a tela e não dá para ver a atividade"*. Medido: na
      cruzadinha de 360x640 o teclado ocupava 368 px de 640 e a grade ficava
      INTEIRA por baixo dele — a criança escrevia às cegas.
   ⚠️ E A REGRA TEM DOIS DEGRAUS, porque medir só um não bastou:
      1. se a PALAVRA inteira cabe na faixa que sobra, ela sobe inteira;
      2. se não cabe (palavra em pé, tela de 320x568 — medido), sobe a CASINHA
         QUE ESTÁ SENDO ESCRITA, centrada na faixa. É o que um campo de texto
         faz: mantém à vista a letra que a pessoa está digitando.
   Por isso ela é chamada duas vezes: ao abrir o teclado e a cada letra.
   ⚠️⚠️ E ELA ATENDE OS DOIS TECLADOS DA CASA, o que é a lição paga aqui
      (15/set/2026): há dois desenhos de teclado nos cadernos de folha viva —
      o da CRUZADINHA, que escreve numa fila de casinhas (`CRUZ.E.cels`), e o
      da SÍLABA/PALAVRA, que escreve numa quadra só (`ATIVA.q`). Eu escrevi
      esta função ancorada no primeiro e a enfiei nos dezoito cadernos pelo
      `function abreCruz(` — que só existe em TRÊS. Nos outros quinze ficou a
      CHAMADA sem a função: `setTimeout(rolaParaCruz, 60)` estourava
      ReferenceError e matava o resto de `ativa()`, que era justamente quem
      escrevia a dica e falava com a criança. O teclado abria mudo.
      O `node --check` não vê isso (a sintaxe está perfeita); quem vê é o
      `_qa/funcoes.py`, o portão "função que não existe" — que eu não rodei. */
function rolaParaCruz(){
  /* ⚠️ VAZIA DE PROPÓSITO, e ela fica aqui em vez de sumir. Enquanto o
     teclado era uma barra fixa nossa, esta função levava a palavra para
     a faixa que sobrava acima dele. Agora quem abre é o teclado do
     aparelho, e o navegador já rola a página sozinho para o campo com
     foco. Apagá-la quebraria as chamadas que ainda existem por aí. */
}
function abreCruz(E, pi){
  /* ⚠️ SEM BARRA FIXA, SEM ROLAGEM FORÇADA. O teclado da casa era fixo no pé da
     tela e tapava a palavra que a criança escrevia — daí existir o `comtec` e o
     `rolaParaCruz`. Agora quem abre é o teclado do APARELHO, que o próprio
     navegador já trata: ele rola a página para deixar o campo com foco à vista.
     Foi por isso que as duas peças saíram daqui juntas. */
  /* ⚠️ Toque na casinha dispara o `onclick` da casinha E o da grade: a mesma
     palavra pede para abrir duas vezes. Se já está aberta, só devolve o foco —
     fechar e reabrir era o que apagava a letra e (antes do conserto acima)
     estourava. */
  if(CRUZ && CRUZ.E === E){ try{ TECIN && TECIN.focus(); }catch(e){} return; }
  if(CRUZ) fechaCruz();
  CRUZ = {E: E, val: "", pi: pi};
  if(E.bt) E.bt.className = E.bt.className.indexOf("oculta") > -1 ? "pista oculta" : "pista ativa";
  pintaCruz();
  var grade = E.cels && E.cels[0] ? E.cels[0].parentNode : null;
  var c = poeCampoSobre(grade);
  c.value = "";
  c.setAttribute("maxlength", String(E.aceita ? E.cels.length : E.w.length));
  c.setAttribute("aria-label", E.rot || "Escreva a palavra");
  try{ c.focus({preventScroll: false}); }catch(e){ c.focus(); }
  falar("escreva");
}
function fechaCruz(){
  /* ⚠️⚠️ LIÇÃO PAGA — "O ALUNO NÃO CONSEGUIA DIGITAR" (Marcos, 18/set/2026, na
     folha 8 d'A Fábrica de Nomes). Aqui estava `CRUZ = null; pintaCruz();` — e
     `pintaCruz` começa lendo `CRUZ.E`. Estourava TypeError toda vez que se
     fechava a caneta. Como a casinha E a grade tinham `onclick`, um toque na
     casinha chamava `abreCruz` duas vezes: a segunda fechava a primeira, o
     fecho estourava, e o `abreCruz` morria ANTES de reabrir. Resultado: a
     criança tocava, nada abria, digitava e nada acontecia — sem erro na tela.
     O jogador da banca não pegou porque clicava na GRADE (um `onclick` só);
     agora ele clica na CASINHA, como a criança. Aqui: pintar com o E guardado
     ANTES de zerar, e nunca ler CRUZ depois de zerá-lo. */
  if(!CRUZ) return;
  var E = CRUZ.E;
  if(E.bt) E.bt.className = E.bt.className.indexOf("oculta") > -1 ? "pista oculta" : "pista";
  CRUZ = null;
  if(TECIN){ TECIN.value = ""; try{ TECIN.blur(); }catch(e){} }
  limpaCruz(E);
}
function limpaCruz(E){
  (E && E.cels || []).forEach(function(c){
    if(!c || c.className.indexOf(" ok") > -1) return;
    var n = c.querySelector(".cn");
    c.textContent = ""; if(n) c.appendChild(n);
    c.className = "ccel viva";
  });
}
function pintaCruz(){
  if(!CRUZ) return;                       /* nunca ler CRUZ.E sem CRUZ */
  var E = CRUZ.E, v = CRUZ.val;
  E.cels.forEach(function(c, i){
    if(!c) return;
    var n = c.querySelector(".cn");
    c.textContent = v.charAt(i) || "";
    if(n) c.appendChild(n);
    c.className = "ccel viva" + (i === v.length ? " ativa" : "");
  });
}
function digitaCruz(ch){
  if(!CRUZ) return;
  sTecla();
  var E = CRUZ.E;
  /* ⚠️ NA FOLHA DE PRODUÇÃO O TAMANHO NÃO É O DO GABARITO: as palavras aceitas
     têm tamanhos diferentes, e o teto é a maior delas (`E.cels.length`). E ela
     NÃO se confere sozinha ao encher — a criança é que diz quando acabou, no
     botão OK. Conferir sozinho recusaria "GATO" no meio de "GATOS". */
  var teto = E.aceita ? E.cels.length : E.w.length;
  if(ch === "ap") CRUZ.val = CRUZ.val.slice(0, -1);
  else if(ch === "ok"){ confereCruz(); return; }
  else { if(CRUZ.val.length >= teto) return; CRUZ.val += ch; }
  pintaCruz(); rolaParaCruz();
  if(!E.aceita && CRUZ.val.length >= E.w.length) setTimeout(confereCruz, 380);
}
/* ⚠️⚠️ O ACENTO NÃO PODE REPROVAR QUEM ACERTOU A PALAVRA (ordem do Marcos,
   15/set/2026, com a turma na sala: *"faça que tanto com o sem dê certo"*).
   O gabarito de BACTERIAS estava sem acento e o teclado da tela TEM os acentos:
   a criança que escrevia BACTÉRIAS — que é o certo em português — era recusada,
   e ficava olhando para uma palavra certa marcada como errada. O contrário
   também acontecia, em caderno cujo gabarito vinha acentuado.
   ⚠️ E ONDE O ACENTO É O CONTEÚDO, ele continua contando: a folha declara
      `exigeAcento` e aí a comparação é letra por letra, acento incluído. */
function semAcento(s){
  s = String(s || "").toUpperCase();
  var de = "ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ", para = "AAAAAEEEEIIIIOOOOOUUUUC", i, o = "";
  for(i = 0; i < s.length; i++){
    var n = de.indexOf(s.charAt(i));
    o += n > -1 ? para.charAt(n) : s.charAt(i);
  }
  return o;
}
function mesmaPalavra(a, b, exigeAcento){
  if(exigeAcento) return String(a).toUpperCase() === String(b).toUpperCase();
  return semAcento(a) === semAcento(b);
}
function confereCruz(){
  if(!CRUZ || !CRUZ.val) return;
  var E = CRUZ.E, pi = CRUZ.pi;
  /* ⚠️⚠️ A FOLHA DE PRODUÇÃO (34) ACEITA MUITAS RESPOSTAS, e sem isto ela seria
     uma armadilha: a criança escreveria uma palavra CERTA e o app diria que
     está errada. Quando `E.aceita` existe, vale qualquer palavra da lista —
     e a que fica escrita nas casas é a que ELA escreveu, não a do gabarito.
     ⚠️ E o gabarito continua existindo (`E.w` = a primeira da lista), porque é
        ele que o jogador da banca digita. */
  var vale = E.aceita
    ? E.aceita.some(function(w){ return mesmaPalavra(CRUZ.val, w, E.exigeAcento); })
    : mesmaPalavra(CRUZ.val, E.w, E.exigeAcento);
  var escrita = E.aceita ? CRUZ.val : E.w;
  if(vale){
    E.cels.forEach(function(c, i){
      if(!c) return;
      var n = c.querySelector(".cn");
      c.textContent = escrita.charAt(i); if(n) c.appendChild(n);
      c.className = "ccel viva" + (i < escrita.length ? " ok" : "");
    });
    if(E.bt) E.bt.className = E.bt.className.indexOf("oculta") > -1 ? "pista oculta" : "pista feita";
    CRUZ = null;
    if(TECIN){ TECIN.value = ""; try{ TECIN.blur(); }catch(e){} }
    acertou(E.id, "certo" + pi + "_" + E.k);
  } else {
    CRUZ.val = ""; pintaCruz();
    errou(E.id, "dica" + pi + "_" + E.k);
  }
}
function montaLigar(caixa, pi, tag, pares, pagina){
  var box = el("div", "ligar"), ce = el("div", "col"), cd = el("div", "col");
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "linhas");
  box.appendChild(ce); box.appendChild(cd); box.appendChild(svg); caixa.appendChild(box);
  var ordem = baralha(pares.map(function(_, i){ return i; }));
  var E = {}, D = {}, marcada = null;
  pares.forEach(function(P){ registra("l" + pi + tag + "_" + P.k, pi, P.k); });
  function centro(e, lado){
    var r = e.getBoundingClientRect(), b = box.getBoundingClientRect();
    return {x: (lado === "e" ? r.right : r.left) - b.left, y: r.top + r.height / 2 - b.top};
  }
  function linha(a, b2, cor){
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var dx = Math.max(28, Math.abs(b2.x - a.x) * 0.45);
    var dd = "M" + a.x + "," + a.y + " C" + (a.x + dx) + "," + a.y + " " +
             (b2.x - dx) + "," + b2.y + " " + b2.x + "," + b2.y;
    var halo = document.createElementNS("http://www.w3.org/2000/svg", "path");
    halo.setAttribute("d", dd); halo.setAttribute("fill", "none");
    halo.setAttribute("stroke", "#ffffff"); halo.setAttribute("stroke-width", 11);
    halo.setAttribute("stroke-linecap", "round");
    var l = document.createElementNS("http://www.w3.org/2000/svg", "path");
    l.setAttribute("d", dd); l.setAttribute("fill", "none");
    l.setAttribute("stroke", cor); l.setAttribute("stroke-width", 6);
    l.setAttribute("stroke-linecap", "round");
    g.appendChild(halo); g.appendChild(l);
    [a, b2].forEach(function(p){
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", 6);
      c.setAttribute("fill", cor); c.setAttribute("stroke", "#fff"); c.setAttribute("stroke-width", 2.5);
      g.appendChild(c);
    });
    svg.appendChild(g); return g;
  }
  function desmarca(){ if(marcada) marcada.el.className = marcada.el.className.replace(" marcada", ""); marcada = null; }
  function redesenha(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    for(var k in E) if(ST.lig["l" + pi + tag + "_" + k]) linha(centro(E[k].el, "e"), centro(D[k].el, "d"), "#15a34a");
  }
  aoAbrir(pagina, redesenha);
  window.addEventListener("resize", function(){ if(pagina.className.indexOf("viva") > -1) redesenha(); });
  function fecha(Re, Rd){
    var id = "l" + pi + tag + "_" + Re.k;
    if(Rd.k === Re.k){
      ST.lig[id] = 1; tentativa(id, true); ST.resp[id] = 1; salvar();
      Re.el.className += " feita"; Rd.el.className += " feita"; desmarca(); redesenha(); sCerto();
      falar(Re.fc); setTimeout(function(){ confereFolha(pi); }, 850);
    } else {
      tentativa(id, false); sErro();
      Rd.el.className += " treme";
      setTimeout(function(){ Rd.el.className = Rd.el.className.replace(" treme", ""); }, 500);
      falar(ST.tent[id].erros >= 2 ? Re.dica : "quase");
      if(ST.tent[id].erros >= 2 && D[Re.k].el.className.indexOf("feita") < 0) D[Re.k].el.className += " mostra";
    }
  }
  pares.forEach(function(P){
    var e = el("div", "ponta" + (ST.lig["l" + pi + tag + "_" + P.k] ? " feita" : ""), P.esq);
    e.setAttribute("role", "button"); e.setAttribute("tabindex", "0");
    e.setAttribute("data-qa", "lig" + tag + "-e-" + P.k);
    e.setAttribute("aria-label", P.ariaE);
    var R = {k: P.k, el: e, fc: P.fc, dica: P.dica};
    E[P.k] = R;
    e.addEventListener("pointerdown", function(ev){
      if(e.className.indexOf("feita") > -1) return;
      ev.preventDefault(); desmarca(); marcada = R; e.className += " marcada"; sPasso(); falar(P.fe);
    });
    e.onkeydown = function(ev){ if(ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); desmarca(); marcada = R; e.className += " marcada"; falar(P.fe); } };
    ce.appendChild(e);
  });
  ordem.forEach(function(j){
    var P = pares[j];
    var e = el("div", "ponta" + (ST.lig["l" + pi + tag + "_" + P.k] ? " feita" : ""), P.dir);
    e.setAttribute("role", "button"); e.setAttribute("tabindex", "0");
    e.setAttribute("data-qa", "lig" + tag + "-d-" + P.k);
    e.setAttribute("aria-label", P.ariaD);
    var R = {k: P.k, el: e}; D[P.k] = R;
    e.addEventListener("pointerdown", function(ev){
      if(e.className.indexOf("feita") > -1) return;
      ev.preventDefault();
      if(marcada) fecha(marcada, R); else { sPasso(); falar(P.fd); falarDepois("ligue", 900); }
    });
    e.onkeydown = function(ev){ if((ev.key === "Enter" || ev.key === " ") && marcada){ ev.preventDefault(); fecha(marcada, R); } };
    cd.appendChild(e);
  });
}

/* ---------- o teclado da tela, e o teclado DE VERDADE ----------
   ⚠️⚠️ O ALFABETO ESTAVA INCOMPLETO, E ISSO TRANCAVA A CRIANÇA (15/set/2026).
   Faltavam K, W e Y — e, pior, faltavam Ê, Â, Ã, Ô, Õ, À e Ü. Quem tentasse
   escrever PÊSSEGO no teclado da tela ou no teclado de verdade ficava com
   "PSSEGO": a tecla não existia, a letra não entrava, e a folha NUNCA FECHAVA.
   Não havia erro nenhum no console; a criança só tentava de novo até desistir.
   Medido com o navegador de verdade, letra por letra, antes deste conserto.
   ⚠️ Quem fecha esta família agora é o portão `_qa/teclado.py`: ele confere que
      o alfabeto tem as 26 letras e os treze acentos do português, e que o
      teclado da tela e o filtro do teclado de verdade usam o MESMO alfabeto —
      porque dois alfabetos diferentes é o mesmo defeito com uma porta só.
   ⚠️ REGRA DAS DUAS PORTAS (Marcos, ago/2026): *"seria interessante se o aluno
   além de teclar no teclado virtual funcionasse se ele tocasse no teclado de
   verdade, as duas opções"*. No PC da escola tem teclado e a criança vai
   digitar; no celular, não tem. Nunca só uma porta. */
/* ============================================================
   O TECLADO DO APARELHO — substitui o teclado de 41 teclas da casa.

   ⭐ ORDEM DO MARCOS (15/set/2026): *"pode remover o teclado das atividades,
      melhor digitar com teclado normal"*. O nosso ocupava 53% de um celular de
      640 px, e mesmo redistribuído para 4 fileiras ainda comia 40%.

   ⚠️ O QUE ELE RESOLVE E O QUE NÃO RESOLVE, dito por inteiro: no PC da escola o
      teclado físico já funcionava (as duas portas são regra da casa desde
      ago/2026) — o campo abaixo não muda nada lá. Ele existe pelo CELULAR, que
      não tem teclado físico: sem um campo de verdade para focar, o aparelho não
      abre teclado nenhum e a criança fica trancada.
   ============================================================ */
var TECIN = null;
function campoTeclado(){
  if(TECIN) return TECIN;
  TECIN = document.createElement("input");
  TECIN.id = "tecIn";
  TECIN.type = "text";
  TECIN.setAttribute("autocomplete", "off");
  TECIN.setAttribute("autocorrect", "off");
  TECIN.setAttribute("autocapitalize", "characters");
  TECIN.setAttribute("spellcheck", "false");
  TECIN.setAttribute("aria-label", "Escreva a palavra");
  TECIN.setAttribute("inputmode", "text");
  /* ⚠️ O EVENTO É `input`, NÃO `keydown`: no celular o teclado do sistema não
     dispara keydown com a letra (ele "compõe" o texto), e um caderno que só
     ouvisse keydown seria mudo justamente no aparelho para o qual este campo
     existe. */
  TECIN.addEventListener("input", function(){
    if(!CRUZ) return;
    var v = (TECIN.value || "").toUpperCase();
    var teto = CRUZ.E.aceita ? CRUZ.E.cels.length : CRUZ.E.w.length;
    if(v.length > teto) v = v.slice(0, teto);
    CRUZ.val = v; TECIN.value = v;
    pintaCruz();
    if(!CRUZ.E.aceita && CRUZ.val.length >= CRUZ.E.w.length) setTimeout(confereCruz, 380);
  });
  TECIN.addEventListener("keydown", function(ev){
    if(ev.key === "Enter"){ ev.preventDefault(); confereCruz(); }
    else if(ev.key === "Escape"){ fechaCruz(); }
  });
  /* ⚠️⚠️ PERDER O FOCO NÃO FECHA MAIS A PALAVRA (18/set/2026). Aqui havia um
     `blur -> fechaCruz()`. Medido no navegador com o gesto da criança: ela toca
     na casinha, toca em "Ouvir a frase" para escutar de novo (o que a folha
     CONVIDA a fazer) e o foco vai para o botão — a palavra fechava, e o que ela
     digitava em seguida caía no vazio. No PC a digitação nem precisa do foco
     (o teclado é ouvido no documento); no celular, tocar de novo na casinha
     devolve o foco e reabre o teclado do aparelho. Então o blur não faz nada. */
  document.body.appendChild(TECIN);
  return TECIN;
}
function poeCampoSobre(grade){
  var c = campoTeclado();
  if(grade && grade.parentNode){
    if(c.parentNode !== grade) grade.appendChild(c);
    c.style.left = "0"; c.style.top = "0";
    c.style.width = "100%"; c.style.height = "100%";
  }
  return c;
}
document.addEventListener("keydown", function(ev){
  if(document.activeElement && document.activeElement.id === "nomeIn") return;
  var k = (ev.key || "").toUpperCase();
  /* ⭐ DIGITAR SEM TER CLICADO ABRE A PRIMEIRA PALAVRA VAZIA DA FOLHA
     (18/set/2026). A criança do 5º ano vê as casinhas e começa a digitar —
     nada dizia "toque nas casinhas primeiro". As DUAS PORTAS valem para o
     gesto também: no PC, o teclado tem de funcionar sem clique. */
  if(!CRUZ && k.length === 1 && "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀÂÃÉÊÍÓÔÕÚÜÇ".indexOf(k) > -1){
    var alvo = null, todos = document.querySelectorAll('.pagina.viva [data-qa^="esc-"]');
    for(var i = 0; i < todos.length && !alvo; i++){
      var idq = todos[i].getAttribute("data-qa").slice(4);
      if(!ST.resp[idq]) alvo = todos[i];
    }
    if(alvo){ alvo.click(); }
  }
  if(!CRUZ) return;
  if(k.length === 1 && "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀÂÃÉÊÍÓÔÕÚÜÇ".indexOf(k) > -1){ ev.preventDefault(); digitaCruz(k); }
  else if(ev.key === "Backspace"){ ev.preventDefault(); digitaCruz("ap"); }
  else if(ev.key === "Enter"){ ev.preventDefault(); digitaCruz("ok"); }
  else if(ev.key === "Escape"){ fechaCruz(); }
});

/* ---------- folha pronta e navegação ---------- */
function idsDaPagina(pi){
  /* ⚠️⚠️ ISTO JÁ MENTIU DUAS VEZES NESTA CASA. Antes, cada folha gravava `n6_0`
     à mão e esta função dizia à mão que a página 6 tinha ids `n6_`. Eram DOIS
     lugares a combinar, os dois sintaticamente corretos, e quando a ordem das
     folhas mudava o relatório saía ZERO com a folha toda respondida — sem erro
     nenhum no console. Agora o id NASCE DA POSIÇÃO e aqui se lê a mesma
     posição; a única forma diferente é o LIGAR, que se declara na constante. */
  var ids = [], i, k, L = (ST.folha["p" + pi] || []);
  if(LIGAR.indexOf(pi) > -1){
    for(i = 0; i < L.length; i++)
      for(k = 0; k < L[i].length; k++) ids.push("l" + pi + "g" + i + "_" + L[i][k]);
    return ids;
  }
  for(i = 0; i < L.length; i++) ids.push("n" + pi + "_" + i);
  return ids;
}
function pendentes(pi){
  var ids = idsDaPagina(pi), n = 0, i;
  for(i = 0; i < ids.length; i++) if(!ST.resp[ids[i]]) n++;
  return n;
}
function confereFolha(pi){
  if(pendentes(pi) > 0 || ST.prontas[pi]) return;
  ST.prontas[pi] = 1; salvar();
  PAGEL[pi].className += " pronta"; sFesta(); confete(24);
  if(pi < PAGEL.length - 1){ falar("folhaPronta"); setTimeout(function(){ if(ST.pag === pi) vaiPara(pi + 1); }, 2400); }
  else setTimeout(fim, 1400);
  atualizaNav();
}
function espelhaNome(t){
  var i = document.getElementById("nomeIn"); if(i && i.value !== t) i.value = t;
}
function vaiPara(pi){
  calar(); fechaCruz();
  document.getElementById("barraCapa").className = pi === 0 ? "aberta" : "";
  if(pi === 0) espelhaNome(ST.nome || "");
  document.getElementById("fim").style.display = "none";
  document.getElementById("retomar").style.display = "none";
  document.getElementById("nav").style.display = pi === 0 ? "none" : "flex";
  for(var i = 0; i < PAGEL.length; i++) PAGEL[i].className = PAGEL[i].className.replace(" viva", "");
  ST.pag = pi; salvar();
  /* ⚠️ GUARDA DO ESQUELETO VAZIO: enquanto o caderno ainda não tem folha
     nenhuma, o "Começar" pede a folha 1 e `PAGEL[1]` não existe — estourava
     `TypeError` e o portão do boot reprovava. Não é defeito do caderno em
     construção; é o esqueleto tendo de abrir limpo ANTES de ter conteúdo, que é
     justamente o que torna o pré-voo útil no primeiro minuto. Num caderno com
     folhas esta guarda nunca dispara. */
  var d = PAGEL[pi];
  if(!d){ atualizaNav(); return; }
  d.className += " viva";
  if(pi > 0) window.scrollTo(0, 0);
  if(d._aoAbrir) for(var z = 0; z < d._aoAbrir.length; z++) (function(fn){ setTimeout(fn, 60); })(d._aoAbrir[z]);
  atualizaNav();
  falarDepois(pi === 0 ? "capa" : "p" + pi + "enun", 280);
}
function atualizaNav(){
  var pi = ST.pag, total = PAGEL.length;
  document.getElementById("pg").textContent = pi === 0 ? "Capa" : "Folha " + pi + " de " + (total - 1);
  var feitas = 0, k; for(k in ST.prontas) feitas++;
  document.getElementById("progI").style.width = (feitas / (total - 1) * 100) + "%";
  document.getElementById("bAnt").disabled = pi === 0;
  var prox = document.getElementById("bProx");
  prox.style.visibility = pi === 0 ? "hidden" : "visible";
  var pend = pi > 0 ? pendentes(pi) : 0;
  prox.innerHTML = pi === total - 1 ? (pend ? "Faltam " + pend : "Ver o resultado")
    : (pend ? "Faltam " + pend + '<i class="seta dir"></i>' : 'Próxima<i class="seta dir"></i>');
  prox.className = pend ? "bt cinza" : "bt verde";
  document.getElementById("navTxt").textContent = pi === 0 ? "" : NOMES[pi - 1];
}

/* ---------- fim: boletim, medalha e relatório ---------- */
/* ⭐⭐ O FECHO A QUALQUER MOMENTO.
   O Marcos fixou a sequência em no mínimo 20 folhas (o piso era 25 e ele o
   baixou em 14/set/2026, por velocidade de produção). Este caderno tem 22, e o
   número saiu do inventário de verbos do `POTE`, não de uma meta. Só que a
   criança DEVAGAR leva bem mais nas mesmas 22 folhas — ela não termina. Se o boletim, o parecer e a
   medalha só existissem DEPOIS da última folha, quem mais precisa do elogio
   seria a única a nunca vê-lo.
   ⚠️ E o boletim conta só o que ela TENTOU. Folha que ela não chegou a abrir
      aparece como "ainda não" — jamais como 0 de 6. */
function fim(){
  /* ⭐⭐ AVISA O CONTROLE DA SALA QUE ESTA CRIANÇA TERMINOU.
     Pedido do Marcos (15/set/2026): *"preciso que essas atividades sequências
     didáticas me avisem quando termino no painel de atividades, aquele que tem
     o controle da sala, assim como as atividades que fazíamos antes"*.

     ⚠️ E ELAS NÃO AVISAVAM POR CAMINHO NENHUM — conferido no código do
     laboratório antes de escrever isto. A tela do aluno (`_lab/index.html`)
     reconhece o fim de DOIS jeitos, e a folha viva escapava dos dois:
       1. A ESPIADA — ela olha dentro do quadro e procura a MEDALHA do fim pela
          CLASSE `.medal`. A folha viva chama a dela de `#medalha`, por id, e
          portanto a espiada nunca a via;
       2. O AVISO — o motor manda `postMessage({eduverse:"terminou"})` ao chegar
          no fim. A folha viva não mandava nada, porque nasceu sem essa peça.
     Agora ela manda o aviso aqui, e a medalha ganhou também a classe `medal`
     no HTML: dois caminhos, um cobrindo o buraco do outro, que é a razão pela
     qual o laboratório tem os dois.

     ⚠️ FORA DO LABORATÓRIO NÃO HÁ PAI NENHUM ESCUTANDO e a linha não faz nada —
     por isso ela é segura em qualquer lugar (em casa, no celular, aberta
     direto pelo link). O `try` existe para o caso de a janela de cima ser de
     outro domínio, quando o navegador recusa a leitura de `window.parent`. */
  try{ if(window.parent && window.parent !== window)
         window.parent.postMessage({eduverse: "terminou"}, "*"); }catch(e){}
  calar();
  var abertas = 0, naoAbertas = [], pp;
  for(pp = 1; pp <= NOMES.length; pp++){
    var idp = idsDaPagina(pp), algum = false, z;
    for(z = 0; z < idp.length; z++) if(ST.tent[idp[z]]) { algum = true; break; }
    if(algum) abertas++; else naoAbertas.push(pp);
  }
  var completo = naoAbertas.length === 0;
  var tf = document.getElementById("fimTit");
  if(tf) tf.textContent = completo ? "Caderno completo!" : "O seu boletim de hoje";
  var bv = document.getElementById("bVoltar");
  if(bv) bv.style.display = completo ? "none" : "";
  for(var i = 0; i < PAGEL.length; i++) PAGEL[i].className = PAGEL[i].className.replace(" viva", "");
  document.getElementById("nav").style.display = "none";
  var f = document.getElementById("fim"); f.style.display = "block";
  var tot = 0, prim = 0, pi;
  for(pi = 1; pi <= NOMES.length; pi++){
    var ids = idsDaPagina(pi);
    for(var j = 0; j < ids.length; j++){
      var t = ST.tent[ids[j]];
      if(!t) continue;
      tot++;
      if(t.erros === 0 && t.ok) prim++;
    }
  }
  var pc = tot ? prim / tot : 0;
  var cheias = pc >= .85 ? 3 : pc >= .6 ? 2 : 1, est = "", ke;
  for(ke = 0; ke < 3; ke++)
    est += '<img src="img/jq_selo' + (ke < cheias ? "" : "_off") + '.png?v=' + VIMG + '" alt="" draggable="false">';
  document.getElementById("estrelas").innerHTML = est;
  document.getElementById("estrelas").setAttribute("aria-label", cheias + " de 3 estrelas");
  var bar = document.getElementById("barras"); bar.innerHTML = "";
  for(pi = 1; pi <= NOMES.length; pi++){
    (function(pi){
      var ids = idsDaPagina(pi), p = 0, nt = 0, j;
      for(j = 0; j < ids.length; j++){
        var tt = ST.tent[ids[j]];
        if(tt) nt++;
        if(tt && tt.erros === 0 && tt.ok) p++;
      }
      if(nt === 0){
        bar.appendChild(el("div", "barra naoabriu",
          "<span>" + NOMES[pi - 1] + "</span><div class='tr'></div><b>ainda não</b>"));
        return;
      }
      var b = el("div", "barra", "<span>" + NOMES[pi - 1] + "</span><div class='tr'><i></i></div><b>" + p + "/" + nt + "</b>");
      bar.appendChild(b);
      setTimeout(function(){ b.querySelector("i").style.width = (nt ? p / nt * 100 : 0) + "%"; }, 400);
    })(pi);
  }
  /* ⭐ O PARECER DA CRIANÇA. O currículo de Blumenau diz que a avaliação orienta
     *"o professor E O ESTUDANTE acerca de quais objetivos foram alcançados"*, e
     que *"mostrar o que sabe ou o que não sabe é pertinente, faz parte do
     crescimento e não da exclusão"*. Então ela vê o que já sabe — na linguagem
     dela, sem número, sem a palavra "errou" e sem porcentagem.
     ⚠️ A ORDEM IMPORTA: primeiro o que ela JÁ SABE; o "vale treinar" vem depois
     e no máximo dois, senão a lista vira boletim de defeitos. */
  var jaSabe = [], treinar = [], q;
  for(q = 0; q < OBJETIVOS.length; q++){
    var Oq = OBJETIVOS[q], mq = mede(Oq.f);
    if(mq.tot === 0 || !mq.tent) continue;
    var pcq = Math.round(100 * mq.prim / mq.tent);
    (pcq >= 75 ? jaSabe : treinar).push(pcq >= 75 ? Oq.ok : Oq.n.toLowerCase());
  }
  var txt = "";
  if(jaSabe.length) txt = "Você já " + jaSabe.slice(0, 3).join("; ") + ".";
  else txt = "Você começou a reparar que o mesmo som pode se escrever de cinco jeitos — e isso é o principal!";
  if(treinar.length) txt += " Vale treinar mais: " + treinar.slice(0, 2).join(" e ") + ".";
  if(!completo)
    txt = "você fez " + abertas + " de " + NOMES.length + " folhas hoje — e olhe o "
        + "que já dá para ver: " + txt.charAt(0).toLowerCase() + txt.slice(1);
  /* ⚠️ SEM NOME, SEM PREFIXO. Com o prefixo fixo saía "Você, você já…" para a
     criança que não escreve o nome na capa — que é justamente a que mais precisa
     que a tela fale direito com ela. */
  var quem = (ST.nome || "").replace(/^\s+|\s+$/g, "");
  document.getElementById("resumo").innerHTML = quem
    ? "<b>" + esch(quem) + "</b>, " + txt.charAt(0).toLowerCase() + txt.slice(1)
    : txt.charAt(0).toUpperCase() + txt.slice(1);
  sFesta(); confete(40); falar("fim");
}
(function(){
  var m = document.getElementById("medalha"), t = null;
  function segura(){ t = setTimeout(function(){ abreRelatorio(); }, 2000); }
  function larga(){ if(t){ clearTimeout(t); t = null; } }
  m.addEventListener("pointerdown", segura);
  m.addEventListener("pointerup", larga);
  m.addEventListener("pointerleave", larga);
  m.addEventListener("pointercancel", larga);
})();

/* ============================================================
   O QUE A ATIVIDADE MEDE — e como isso vira PARECER e NOTA

   ⚠️ A NOTA FICA COM O PROFESSOR. A Instrução Normativa SEMED nº 1/2017, art.
   3º, citada no currículo de Blumenau, manda avaliar *"com preponderância dos
   aspectos qualitativos sobre os quantitativos"*. O parecer vai para a criança;
   o número fica só aqui.
   ⚠️ E NÃO SE CONTA TUDO IGUAL: acerto de primeira vale 1,0 e acerto com ajuda
   vale 0,6 — o relatório mostra os dois lado a lado, para o professor ver a
   nota E o esforço que ela custou. O critério sai impresso por exigência da
   mesma Instrução (*"a exposição de critérios utilizados"*).
   ============================================================ */
var PESO_PRIMEIRA = 1.0, PESO_COM_AJUDA = 0.6;

/* ⚠️ ESTA LISTA E O `curriculo.json` SÃO A MESMA COISA, ditas para dois
   leitores: aqui em palavras que o professor lê no relatório, lá no vocabulário
   do currículo da rede. O portão `_qa/pedagogo_curriculo.py` reprova se os nomes
   e as folhas não baterem um a um. Os números são POSIÇÕES de folha: mudou a
   ordem, mudam aqui e no `curriculo.json`, no mesmo commit. *//* ⚠️ ESTA LISTA E O `curriculo.json` SÃO A MESMA COISA, ditas para dois
   leitores: aqui em palavras que o professor lê no relatório, lá no vocabulário
   do currículo da rede. O portão `_qa/pedagogo_curriculo.py` reprova se os
   nomes e as folhas não baterem um a um, e também se alguma folha de trabalho
   ficar sem objetivo que a meça. Os números são POSIÇÕES de folha.
   Ex.: {n: "Distinguir X de Y", f: [1, 2, 3],
         ok:  "faz o que o objetivo pede, em palavras do professor",
         nao: "o que ainda não faz — sem a palavra 'errou'"}  */
var OBJETIVOS = [
  {n: "Achar onde uma palavra acaba e a outra começa, numa frase grudada", f: [1, 2, 3],
   ok: "corta a frase grudada nos lugares certos, sem chutar"},
  {n: "Separar palavras grudadas e ainda dizer a qual grupo cada uma pertence", f: [4, 5],
   ok: "guarda cada palavra da lista na gaveta dela"},
  {n: "Reconhecer, entre duas escritas, a que tem os espaços no lugar", f: [6],
   ok: "escolhe a frase escrita com os espaços certos"},
  {n: "Pôr palavras soltas na ordem, formando uma frase que faz sentido", f: [7, 8, 19, 28],
   ok: "ordena as palavras e os versos e monta a frase inteira"},
  {n: "Escrever a palavra que a figura nomeia, inteira e no lugar dela", f: [9, 10, 31, 32],
   ok: "escreve o nome da figura dentro da frase, com as letras todas"},
  {n: "Ligar a frase à figura de que ela fala", f: [11],
   ok: "liga cada frase à figura certa"},
  {n: "Ver que uma palavra só não se parte no meio (a gora, com migo)", f: [12, 13, 14],
   ok: "reconhece e junta a palavra que tinha sido partida ao meio"},
  {n: "Dizer qual dos dois erros está na frente: grudou demais ou partiu demais", f: [15, 33],
   ok: "separa os dois erros e acha a escrita certa entre três"},
  {n: "Segmentar um TEXTO inteiro: parlenda e cantiga, verso a verso", f: [16, 18, 20],
   ok: "corta os versos da parlenda e da cantiga sem perder o fio"},
  {n: "Contar as palavras de um verso, contando também o O e o A", f: [17, 21, 30],
   ok: "marca e conta cada palavra do verso, inclusive as de uma letra"},
  {n: "Descobrir que dentro de uma palavra mora outra palavra", f: [22, 23, 24],
   ok: "acha a palavra escondida dentro da palavra maior"},
  {n: "Escolher e escrever sem grudar as palavrinhas que mais grudam", f: [25, 29],
   ok: "escreve agora, comigo, devagar e escolhe a palavra que falta"},
  {n: "Segmentar um bilhete inteiro, do começo ao fim", f: [26, 27, 34, 35],
   ok: "corta as frases do bilhete e do mural sem ajuda"}
];

function mede(folhas){
  var prim = 0, ajuda = 0, tot = 0, tentados = 0, k, j;
  for(k = 0; k < folhas.length; k++){
    var ids = idsDaPagina(folhas[k]);
    tot += ids.length;
    for(j = 0; j < ids.length; j++){
      var t = ST.tent[ids[j]];
      if(t) tentados++;
      if(!t || !t.ok) continue;
      if(t.erros === 0) prim++; else ajuda++;
    }
  }
  return {prim: prim, ajuda: ajuda, tot: tot, tent: tentados,
          pontos: prim * PESO_PRIMEIRA + ajuda * PESO_COM_AJUDA,
          pc: tot ? Math.round(100 * prim / tot) : 0};
}

function abreRelatorio(){
  var r = document.getElementById("relatorio");
  var linhas = "", domina = [], retomar = [], k;
  var pontos = 0, total = 0, primG = 0, ajudaG = 0, tentG = 0;
  var naoAlcancou = [];
  var folhasFeitas = 0, fz;
  for(fz = 1; fz <= NOMES.length; fz++){
    var idf = idsDaPagina(fz), tocou = false, y;
    for(y = 0; y < idf.length; y++) if(ST.tent[idf[y]]) { tocou = true; break; }
    if(tocou) folhasFeitas++;
  }
  var inteiro = folhasFeitas >= NOMES.length;

  for(k = 0; k < OBJETIVOS.length; k++){
    var O = OBJETIVOS[k], m = mede(O.f);
    pontos += m.pontos; total += m.tot; primG += m.prim; ajudaG += m.ajuda;
    tentG += m.tent;
    /* ⚠️⚠️ O QUE DECIDE É O QUE ELA FEZ. Antes, num caderno não terminado, o
       objetivo cujas folhas ela nem alcançou entrava em "retomar" com 0% — e o
       parecer dizia "precisa retomar" de uma criança que tinha ido bem no que
       deu tempo de fazer. Um julgamento errado com cara de medida, contra a
       criança. Objetivo não tocado não entra em lista nenhuma. */
    var pcObj = m.tent ? Math.round(100 * m.prim / m.tent) : -1;
    if(pcObj < 0) naoAlcancou.push(O.n.toLowerCase());
    else if(pcObj >= 75) domina.push(O.ok);
    else retomar.push(O.n.toLowerCase() + " (" + pcObj + "%)");
    var pcf = m.tent ? Math.round(100 * m.prim / m.tent) : 0;
    linhas += "<tr><td>" + esch(O.n) + "</td><td>" + m.prim + "/" + m.tot +
      "</td><td><b>" + m.pc + "%</b></td><td>" +
      (m.tent ? "<b>" + pcf + "%</b> <small>(" + m.prim + "/" + m.tent + ")</small>"
              : "<small>não fez</small>") + "</td><td>" + m.ajuda + "</td></tr>";
  }

  /* ⚠️ A NOTA DE UM CADERNO NÃO TERMINADO SE MEDE NO QUE FOI FEITO. Dividir
     pelos itens que ela nunca viu dá uma nota que não fala dela — fala do
     relógio. Com o caderno completo, os dois denominadores são o mesmo número. */
  var baseNota = inteiro ? total : tentG;
  var nota = baseNota ? Math.round(100 * pontos / baseNota) / 10 : 0;
  var pc = baseNota ? Math.round(100 * primG / baseNota) : 0;
  var conceito = !baseNota ? "Sem dados" :
    nota >= 8.5 ? "Dominou" : nota >= 6 ? "Está construindo" : "Precisa retomar";
  if(!inteiro) conceito += " (parcial)";

  var nome = esch(ST.nome || "O aluno");
  var parecer = nome + " ";
  if(domina.length && !retomar.length && !naoAlcancou.length)
    parecer += "domina os objetivos avaliados: " + domina.join("; ") + ".";
  else if(domina.length)
    parecer += "já " + domina.join("; ") + ". Ainda precisa retomar: " + retomar.join(", ") + ".";
  else
    parecer += "está começando a perceber que letras diferentes fazem o mesmo som. Nenhum " +
      "objetivo chegou a 75% de acerto de primeira — vale retomar ORALMENTE, ditando cinco " +
      "palavras por dia e perguntando POR QUE se escreve com aquela letra, antes de voltar " +
      "à tela. A regra dita em voz alta fixa mais do que a palavra copiada dez vezes.";
  if(naoAlcancou.length)
    parecer += " Ainda não chegou a fazer (a aula acabou antes): " + naoAlcancou.join(", ") + ".";

  var h = "<b>Relatório do professor</b> &mdash; " + nome + " &middot; " +
    Math.round((Date.now() - (ST.inicio || Date.now())) / 60000) + " min" +
    "<div class='notao'><span class='nn'>" + nota.toFixed(1).replace(".", ",") + "</span>" +
    "<span class='nl'><b>" + conceito + "</b><br>" + primG + " de " + baseNota +
    " de primeira (" + pc + "%)<br>" + ajudaG + " com ajuda</span></div>" +
    "<p class='parecer'>" + parecer + "</p>" +
    (inteiro ? "" :
      "<p class='avisoparcial'><b>Caderno não terminado:</b> " + folhasFeitas +
      " de " + NOMES.length + " folhas. A coluna <b>%</b> conta o caderno inteiro; " +
      "a coluna <b>do que fez</b> conta só o que a criança chegou a responder — " +
      "é esta que diz como ela foi.</p>") +
    "<table><tr><th>Objetivo</th><th>De primeira</th><th>%</th>" +
    "<th>do que fez</th><th>Com ajuda</th></tr>" + linhas + "</table>" +
    "<p class='comonota'>Nota de 0 a 10: acerto de primeira vale 1,0 e acerto com ajuda vale 0,6. " +
    "A criança não vê este número — ele fica só aqui.</p>" +
    "<p class='comonota'><b>O que este caderno NÃO mede:</b> várias das folhas de papel que " +
    "deram origem a ele terminam em <b>&ldquo;copie no seu caderno&rdquo;</b> e " +
    "<b>&ldquo;classifique no caderno&rdquo;</b> &mdash; e a tela não corrige o que a criança " +
    "escreve à mão. O que dá para medir aqui é reconhecer, marcar e escrever com o teclado. " +
    "<b>A cópia e o ditado no papel continuam sendo do professor</b>, e a folha 22 existe para " +
    "isso: a criança sai daqui com o quadro de regras dela para copiar no caderno.</p>";
  r.innerHTML = h; r.style.display = "block"; sPasso();
}
function esch(t){
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------- retomar, chave mestra e a partida ---------- */
var CHAVE_MESTRA = "1275@";
function abreMenuProf(){
  var cx = document.getElementById("mpFolhas");
  if(!cx.childNodes.length){
    var mk = function(rot, alvo){
      var b = el("button", null, rot);
      b.onclick = function(){ fechaMenuProf(); vaiPara(alvo); };
      cx.appendChild(b);
    };
    mk("Capa", 0);
    /* ⚠️ `NOMES.length` e não um número cravado: com "10" escrito aqui, um
       caderno de 25 folhas mostrava só as dez primeiras no menu do professor —
       e as quinze restantes ficavam sem como conferir. */
    for(var k = 1; k <= NOMES.length; k++) mk(k + ". " + NOMES[k - 1], k);
  }
  calar(); document.getElementById("menuProf").className = "aberto";
}
function fechaMenuProf(){ document.getElementById("menuProf").className = ""; }
document.getElementById("mpFechar").onclick = fechaMenuProf;
document.getElementById("menuProf").onclick = function(ev){ if(ev.target === this) fechaMenuProf(); };
document.getElementById("nomeIn").oninput = function(){
  if(this.value.indexOf(CHAVE_MESTRA) > -1){ this.value = ST.nome || ""; abreMenuProf(); return; }
  ST.nome = this.value.slice(0, 24); espelhaNome(ST.nome); salvar();
};
document.getElementById("nomeIn").onkeydown = function(ev){ if(ev.key === "Enter"){ ev.preventDefault(); this.blur(); } };
document.getElementById("bComecar").onclick = function(){ ac(); sPasso(); if(!ST.inicio) ST.inicio = Date.now(); vaiPara(1); };
document.getElementById("bAnt").onclick = function(){ sPasso(); vaiPara(Math.max(0, ST.pag - 1)); };
document.getElementById("bProx").onclick = function(){
  sPasso();
  if(ST.pag === PAGEL.length - 1 && pendentes(ST.pag) === 0) return fim();
  vaiPara(Math.min(PAGEL.length - 1, ST.pag + 1));
};
document.getElementById("bOuvir").onclick = function(){ ac(); if(ultimaFala) falar(ultimaFala); };
document.getElementById("bVoz").onclick = function(){
  vozLigada = !vozLigada; this.className = vozLigada ? "zap" : "zap off";
  if(!vozLigada) calar(); else falar("vozOn");
};
document.getElementById("bRever").onclick = function(){ sPasso(); vaiPara(1); };
document.getElementById("bRecomecar").onclick = function(){
  sPasso(); try{ localStorage.removeItem(CHAVE_LS); }catch(e){}
  ST = {pag: 0, nome: ST.nome, folha: novaFolha(), resp: {}, lig: {}, tent: {}, prontas: {}, inicio: 0};
  monta(); vaiPara(0); falarDepois("novoCaderno", 400);
};
document.getElementById("bContinuar").onclick = function(){ ac(); sPasso(); vaiPara(ST.pag || 1); };
document.getElementById("bZerar").onclick = function(){ document.getElementById("bRecomecar").onclick(); };

(function boot(){
  var velho = carregar();
  if(velho && velho.folha){
    ST = velho;
    if(!ST.resp) ST.resp = {}; if(!ST.lig) ST.lig = {}; if(!ST.tent) ST.tent = {}; if(!ST.prontas) ST.prontas = {};
    /* ⚠️ TRAVA 2 — A REDE DE SEGURANÇA. Se montar a partir da memória estourar
       por qualquer motivo que eu não previ, o caderno joga a memória fora e
       abre LIMPO. Perder o "continuar de onde parou" é ruim; ficar com uma tela
       morta a aula toda é muito pior. */
    try{ monta(); }
    catch(erroMemoria){
      try{ localStorage.removeItem(CHAVE_LS); }catch(e3){}
      ST = {pag: 0, nome: ST.nome, folha: novaFolha(), resp: {}, lig: {}, tent: {}, prontas: {}, inicio: 0};
      monta(); vaiPara(0); return;
    }
    document.getElementById("retomar").style.display = "block";
    document.getElementById("retTxt").textContent =
      (ST.nome ? ST.nome + ", você" : "Você") + " parou na folha " + (ST.pag || 1) + ": " + NOMES[(ST.pag || 1) - 1] + ".";
    document.getElementById("nav").style.display = "none";
  } else {
    ST.folha = novaFolha(); monta(); vaiPara(0);
  }
})();

/*<dossie-js>*/
/* ============================================================
   DOSSIÊ PEDAGÓGICO — o que o PROFESSOR vê quando abre a atividade

   ⭐ PEDIDO DO MARCOS (set/2026): *"preciso que quando um professor olhe e
      analise a atividade ele veja que está ótima"*.

   O buraco que isto fecha: o parecer pedagógico de cada caderno existia — mas
   morava num arquivo `.md` DENTRO DO REPOSITÓRIO, que nenhum professor abre.
   Quem olhava a atividade via um joguinho bonito e não tinha como saber se
   aquilo estava alinhado ao currículo da rede. Agora o alinhamento está DENTRO
   da atividade, a um toque — e a qualquer momento, não só no fim.

   ⚠️ E não é texto solto: cada habilidade citada aqui vem do
   `<pasta>/curriculo.json`, e o portão `_qa/pedagogo_curriculo.py` reprova se a frase
   citada não existir, palavra por palavra, no `_curriculo/blumenau.txt`, ou se
   os objetivos do relatório e os do currículo não baterem um a um. Citação de
   currículo é a única coisa que o professor NÃO tem como conferir sozinho sem
   abrir 440 páginas de PDF — por isso ela é medida.

   Abre por dois caminhos: o botão no menu do professor (chave mestra 1275@,
   vale a qualquer hora) e o botão dentro do relatório, no fim.

   Este arquivo é a FONTE: `python3 _padrao/dossie_professor.py <pasta>` injeta o CSS, o
   trecho de tela e este código no caderno. Não editar a cópia injetada.
   ============================================================ */
function dossieCita(s){
  var m = String(s || "").match(/[“"]([^”"]+)[”"]/);
  return m ? m[1] : String(s || "");
}
function dossieHTML(){
  var C = (typeof CURRICULO === "object" && CURRICULO) ? CURRICULO : null;
  if(!C) return "<p>Este caderno ainda não declarou o currículo.</p>";
  var h = "", k, o;
  h += "<p class='dfonte'><b>" + esch(C.componente) + " &middot; " + C.ano +
       "º ano.</b> " + esch(C.rede) + ". As habilidades abaixo estão " +
       "<b>copiadas do documento oficial, palavra por palavra</b> &mdash; nenhuma " +
       "foi reescrita nem resumida.</p>";
  h += "<table><tr><th>O que a atividade mede</th><th>Folhas</th>" +
       "<th>Habilidade do currículo da rede</th></tr>";
  for(k = 0; k < C.objetivos.length; k++){
    o = C.objetivos[k];
    h += "<tr><td>" + esch(o.objetivo) + "</td><td>" + o.folhas.join(", ") +
         "</td><td>&ldquo;" + esch(dossieCita(o.habilidade)) + "&rdquo;" +
         "<span class='dobj'>" + esch(o.pratica) + " &middot; " +
         esch(o.objeto) + "</span></td></tr>";
  }
  h += "</table>";

  h += "<p class='dsub'><b>A escada didática</b> &mdash; uma folha por degrau, e " +
       "nenhuma repete o gesto da anterior:</p><ol class='descada'>";
  for(k = 0; k < NOMES.length; k++) h += "<li>" + esch(NOMES[k]) + "</li>";
  h += "</ol>";

  h += "<p class='dsub'><b>Como a criança é avaliada</b></p>" +
       "<p class='dtxt'>O relatório do professor (no fim, segurando a medalha por " +
       "2 segundos) traz, por objetivo: quantos itens ela acertou <b>de primeira</b>, " +
       "quantos precisou de ajuda e a porcentagem. A partir de 75% de acerto de " +
       "primeira o objetivo conta como dominado. Sai também um parecer em palavras " +
       "&mdash; do jeito que se escreve no bimestral &mdash; e uma nota de 0 a 10 " +
       "que <b>a criança não vê</b>. Dentro da atividade não há nota, nem ranking, " +
       "nem a palavra &ldquo;errou&rdquo;: o erro responde na hora e diz o que " +
       "olhar, e a ajuda cresce a cada tentativa (dica &rarr; apoio concreto &rarr; " +
       "revelar).</p>";

  if(C.evidencia && C.evidencia.length){
    h += "<p class='dsub'><b>O que foi medido antes de publicar</b></p><ul class='dev'>";
    for(k = 0; k < C.evidencia.length; k++) h += "<li>" + esch(C.evidencia[k]) + "</li>";
    h += "</ul>";
  }
  return h;
}
function abreDossie(){
  var cx = document.getElementById("dsCorpo");
  if(!cx) return;
  if(typeof calar === "function") calar();
  cx.innerHTML = dossieHTML();
  document.getElementById("dossie").className = "aberto";
  cx.scrollTop = 0;
}
function fechaDossie(){ document.getElementById("dossie").className = ""; }
(function(){
  var b = document.getElementById("bDossie"), f = document.getElementById("dsFechar"),
      cx = document.getElementById("dossie");
  if(b) b.onclick = function(){ fechaMenuProf(); abreDossie(); };
  if(f) f.onclick = fechaDossie;
  if(cx) cx.onclick = function(ev){ if(ev.target === this) fechaDossie(); };

  /* o segundo caminho: o botão nasce DENTRO do relatório, quando ele abre.
     Fica ali e não na tela final porque o relatório é a parte que a criança
     não vê — e o dossiê é conversa de adulto. */
  if(typeof abreRelatorio === "function"){
    var antes = abreRelatorio;
    abreRelatorio = function(){
      antes.apply(this, arguments);
      var r = document.getElementById("relatorio");
      if(r && !r.querySelector(".bdossie")){
        var bt = document.createElement("button");
        bt.className = "bt bdossie";
        bt.textContent = "Dossiê pedagógico (currículo da rede)";
        bt.onclick = abreDossie;
        r.appendChild(bt);
      }
    };
  }
}());
/*</dossie-js>*/

/* ⭐ o botão "Terminar" e o "Voltar para o caderno" — ver o comentário do fim() */
(function(){
  var bt = document.getElementById("bTerminar");
  if(bt) bt.onclick = function(){
    var falta = 0, pz;
    for(pz = 1; pz <= NOMES.length; pz++) falta += pendentes(pz);
    if(falta && !confirm("Quer fechar o caderno e ver o seu boletim?\n\nVocê pode voltar depois e continuar de onde parou."))
      return;
    fim();
  };
  var bv = document.getElementById("bVoltar");
  if(bv) bv.onclick = function(){
    document.getElementById("fim").style.display = "none";
    vaiPara(ST.pag || 1);
  };
})();

function figOu(f, cls){ return f ? img("jq_" + f + ".png", cls || "fig", "") : ""; }

/* PEÇA — MARQUE VÁRIAS E SÓ DEPOIS CONFIRA (_sil2) */
function marqueConfira(box, id, pi, pecas, fCerto, fDica){
  var feito = !!ST.resp[id], marcadas = {}, bts = [];
  registra(id, pi, pecas.filter(function(p){ return p.ok; })
                        .map(function(p){ return p.k; }).join(" "));
  var cx = el("div", "sils");
  pecas.forEach(function(P){
    var b = el("button", "sil" + (feito && P.ok ? " ok" : ""), P.t);
    b.setAttribute("aria-label", P.t);
    b.setAttribute("data-qa", (P.ok ? "op-" : "no-") + id + "-" + P.k);
    b.onclick = function(){
      if(ST.resp[id]) return;
      sPasso();
      if(P.fala) P.fala();
      if(marcadas[P.k]){ delete marcadas[P.k]; b.className = "sil"; }
      else { marcadas[P.k] = 1; b.className = "sil marcada"; }
    };
    cx.appendChild(b); bts.push({b: b, P: P});
  });
  box.appendChild(cx);
  var cf = el("button", "bt verde pronto", "Conferir");
  cf.setAttribute("data-qa", "conferir-" + id);
  cf.onclick = function(){
    if(ST.resp[id]) return;
    var certo = true;
    bts.forEach(function(x){ if(!!marcadas[x.P.k] !== !!x.P.ok) certo = false; });
    if(certo){
      bts.forEach(function(x){ if(x.P.ok) x.b.className = "sil ok"; });
      acertou(id, fCerto); box.className = "item feito"; cf.style.display = "none";
    } else {
      sErro(); cx.className = "sils erro";
      setTimeout(function(){ cx.className = "sils"; }, 480);
      errou(id, fDica);
    }
  };
  if(feito) cf.style.display = "none";
  box.appendChild(cf);
}

/* PEÇA — ACHAR DENTRO DO TEXTO (_ponto2, f25/f26) */
function noTexto(d, pi, T, fCerto, fDica){
  var id = "n" + pi + "_0", box = item(0);
  registra(id, pi, T.ok.map(function(w){ return "w" + chaveQuadro(w); }).join(" "));
  var marcadas = {}, bts = [];
  var cx = el("div", "texto");
  cx.appendChild(el("h3", "ttit", T.titulo));
  var nw = 0;
  T.linhas.forEach(function(lin){
    var l = el("p", "tlin");
    lin.forEach(function(w) {
      var ok = T.ok.indexOf(w) > -1, meu = nw;
      var b = el("button", "palav", w);
      b.setAttribute("aria-label", w);
      b.setAttribute("data-qa", ok ? ("op-" + id + "-w" + chaveQuadro(w))
                                   : ("no-" + id + "-x" + meu));
      nw++;
      b.onclick = function(){
        if(ST.resp[id]) return;
        sPasso(); falar("tx" + pi + "_" + meu);
        if(marcadas[w]){ delete marcadas[w]; b.className = "palav"; }
        else { marcadas[w] = 1; b.className = "palav marcada"; }
      };
      l.appendChild(b); l.appendChild(document.createTextNode(" "));
      bts.push({b: b, w: w, ok: ok});
    });
    cx.appendChild(l);
  });
  box.appendChild(cx);
  var cf = el("button", "bt verde pronto", "Conferir");
  cf.setAttribute("data-qa", "conferir-" + id);
  cf.onclick = function(){
    if(ST.resp[id]) return;
    var certo = true;
    bts.forEach(function(x){ if(!!marcadas[x.w] !== !!x.ok) certo = false; });
    if(certo){
      bts.forEach(function(x){ if(x.ok) x.b.className = "palav ok"; });
      acertou(id, fCerto); box.className = "item feito"; cf.style.display = "none";
    } else {
      sErro(); cx.className = "texto erro";
      setTimeout(function(){ cx.className = "texto"; }, 480);
      errou(id, fDica);
    }
  };
  if(ST.resp[id]) cf.style.display = "none";
  box.appendChild(cf);
  fechaItem(d, box, id);
}

/* PEÇA — O TECLADO NUMA FILA DE CASINHAS (_ponto2, f24/f32): a grade com o
   número exato de letras, aberta pelo teclado do aparelho ou pelo de verdade. */
function gradeEscrever(box, id, pi, k, w, rot, aceita){
  registra(id, pi, aceita ? aceita[0] : w);
  var mx = w.length, t;
  if(aceita) aceita.forEach(function(x){ if(x.length > mx) mx = x.length; });
  var grade = el("div", "cruz uma" + (aceita ? " livre" : "")), cels = [];
  grade.setAttribute("data-qa", "esc-" + id);
  for(t = 0; t < mx; t++){
    var c = el("button", "ccel viva" + (ST.resp[id] ? " ok" : ""),
               ST.resp[id] ? ((aceita ? aceita[0] : w).charAt(t) || "") : "");
    c.setAttribute("aria-label", "Casa da palavra");
    cels.push(c); grade.appendChild(c);
  }
  box.appendChild(grade);
  var E = {k: k, w: aceita ? aceita[0] : w, id: id, cels: cels, rot: rot || "Escreva a palavra",
           bt: el("span", "pista oculta", "")};
  if(aceita) E.aceita = aceita;
  cels.forEach(function(c){ c.onclick = function(){ if(!ST.resp[id]) abreCruz(E, pi); }; });
  grade.onclick = function(){ if(!ST.resp[id]) abreCruz(E, pi); };
  return E;
}

/* PEÇA — A CRUZADINHA QUE SE MONTA SOZINHA (_ort5b, f21): a primeira palavra
   deita e as outras se penduram nela pela letra em comum. A pista aqui é TEXTO
   (o contrário de…), não figura. */
function cruzadinha(d, pi, DADOSC, prefFala){
  var pool = ST.folha["p" + pi];
  var mapa = {}, maxX = 0, maxY = 0, entradas = [];
  function poe(w, x, y, hor){
    var i;
    for(i = 0; i < w.length; i++){
      var cx = x + (hor ? i : 0), cy = y + (hor ? 0 : i);
      mapa[cx + "," + cy] = w.charAt(i);
      if(cx > maxX) maxX = cx;
      if(cy > maxY) maxY = cy;
    }
  }
  function cabe(w, x, y, hor){
    var i;
    for(i = 0; i < w.length; i++){
      var cx = x + (hor ? i : 0), cy = y + (hor ? 0 : i);
      var q = mapa[cx + "," + cy];
      if(q && q !== w.charAt(i)) return false;
      if(!q){
        var a = hor ? mapa[cx + "," + (cy - 1)] : mapa[(cx - 1) + "," + cy];
        var b = hor ? mapa[cx + "," + (cy + 1)] : mapa[(cx + 1) + "," + cy];
        if(a || b) return false;
      }
    }
    var antes = hor ? mapa[(x - 1) + "," + y] : mapa[x + "," + (y - 1)];
    var dep = hor ? mapa[(x + w.length) + "," + y] : mapa[x + "," + (y + w.length)];
    return !antes && !dep;
  }
  var linhaLivre = 0;
  pool.forEach(function(k, n){
    var w = DADOSC[k].p.replace(/[^A-ZÁÂÃÉÊÍÓÔÕÚÇ]/g, ""), col = null;
    if(!entradas.length){ col = {x: 0, y: 0, hor: true}; }
    else {
      var i, j, achou = null;
      for(i = 0; i < w.length && !achou; i++)
        for(j = 0; j < entradas.length && !achou; j++){
          var E = entradas[j], p;
          for(p = 0; p < E.w.length; p++){
            if(E.w.charAt(p) !== w.charAt(i)) continue;
            var hor = !E.hor;
            var x = hor ? E.x - i : E.x + p;
            var y = hor ? E.y + p : E.y - i;
            if(cabe(w, x, y, hor)){ achou = {x: x, y: y, hor: hor}; break; }
          }
        }
      col = achou || {x: 0, y: maxY + 2 + (linhaLivre++), hor: true};
    }
    poe(w, col.x, col.y, col.hor);
    entradas.push({k: k, w: w, x: col.x, y: col.y, hor: col.hor, n: n + 1});
  });
  var minX = 0, minY = 0, key;
  for(key in mapa){
    var pxy = key.split(","), px = +pxy[0], py = +pxy[1];
    if(px < minX) minX = px;
    if(py < minY) minY = py;
  }
  var env = el("div", "cruzenv"), grade = el("div", "cruz");
  var larg = maxX - minX + 1, alt = maxY - minY + 1;
  grade.style.gridTemplateColumns = "repeat(" + larg + ",-webkit-max-content)";
  grade.style.gridTemplateColumns = "repeat(" + larg + ",max-content)";
  var celula = {}, yy, xx;
  for(yy = 0; yy < alt; yy++) for(xx = 0; xx < larg; xx++){
    var ch = mapa[(xx + minX) + "," + (yy + minY)];
    if(!ch){ grade.appendChild(el("span", "ccel")); continue; }
    var c = el("button", "ccel viva", "");
    c.setAttribute("aria-label", "Casa da cruzadinha");
    c._x = xx + minX; c._y = yy + minY;
    celula[c._x + "," + c._y] = c;
    grade.appendChild(c);
  }
  env.appendChild(grade); d.appendChild(env);
  var pistas = el("div", "pistas");
  entradas.forEach(function(E, i){
    var id = "n" + pi + "_" + i;
    registra(id, pi, E.w);
    E.id = id; E.cels = []; E.rot = "Escreva a palavra " + E.n;
    var t;
    for(t = 0; t < E.w.length; t++){
      var cc = celula[(E.x + (E.hor ? t : 0)) + "," + (E.y + (E.hor ? 0 : t))];
      E.cels.push(cc);
      if(t === 0 && cc && !cc.querySelector(".cn")) cc.appendChild(el("span", "cn", E.n));
    }
    if(ST.resp[id]) E.cels.forEach(function(c, t2){
      if(c){ c.className = "ccel viva ok"; c.textContent = E.w.charAt(t2);
             if(t2 === 0) c.appendChild(el("span", "cn", E.n)); } });
    var p = el("button", "pista" + (ST.resp[id] ? " feita" : ""),
               '<span class="pn">' + E.n + ".</span> " + DADOSC[E.k].d);
    p.setAttribute("data-qa", "esc-" + id);
    p.setAttribute("aria-label", "Pista " + E.n + " da cruzadinha");
    E.bt = p;
    p.onclick = function(){
      if(ST.resp[id]) return;
      sPasso(); falar(prefFala + E.k);
      abreCruz(E, pi);
    };
    pistas.appendChild(p);
    E.cels.forEach(function(c){
      if(!c) return;
      c.addEventListener("click", function(){ if(!ST.resp[id]) abreCruz(E, pi); });
    });
  });
  d.appendChild(pistas);
}

/* PEÇA — O CAÇA-PALAVRAS (_ponto2, f27). CONTRATO: `cp-<id>-a` e `cp-<id>-z`. */
function cacaPalavras(d, pi, C, rotulo){
  var cels = {};
  var g = el("div", "cpgrade");
  C.grade.forEach(function(lin, y){
    var l = el("div", "cplin");
    lin.forEach(function(L, x){
      var b = el("button", "cpcel", L);
      b.setAttribute("aria-label", L);
      cels[y + "," + x] = b; l.appendChild(b);
    });
    g.appendChild(l);
  });
  d.appendChild(g);
  var lista = el("div", "cplista");
  ST.folha["p" + pi].forEach(function(k, i){
    var P = C.pal[k], id = "n" + pi + "_" + i;
    registra(id, pi, "cpa cpz");
    var rot = el("div", "cprot" + (ST.resp[id] ? " achada" : ""), rotulo + " <b>" + P.pista + "</b>");
    rot.appendChild(botaoSom("Ouvir a pista", function(){ falar("cp_" + k); }));
    lista.appendChild(rot);
    var ca = cels[P.a[0] + "," + P.a[1]], cz = cels[P.z[0] + "," + P.z[1]];
    ca.setAttribute("data-qa", "cp-" + id + "-a");
    cz.setAttribute("data-qa", "cp-" + id + "-z");
    function marca(){
      var y = P.a[0], x;
      for(x = P.a[1]; x <= P.z[1]; x++) cels[y + "," + x].className = "cpcel achada";
      rot.className = "cprot achada";
    }
    if(ST.resp[id]) marca();
    var passo = 0;
    [ca, cz].forEach(function(cel, n){
      cel.addEventListener("click", function(){
        if(ST.resp[id]) return;
        sPasso();
        if(n === 0){ passo = 1; cel.className = "cpcel pega"; return; }
        if(passo !== 1){ falar("cacatoque"); return; }
        marca(); acertou(id, "certo" + pi + "_" + k);
      });
    });
  });
  d.appendChild(lista);
}

/* PEÇA — PEGAR E SOLTAR NUM ALVO COMPARTILHADO (_ponto2, f1): a peça é o item,
   o alvo se declara no nível da página como `alvo-<chave>`, e a resposta do item
   é ">chave". As duas portas: puxar OU tocar-tocar. */
function pegaSolta(d, pi, alvosHTML, itens, chaveAlvo, falaItem, cls, alvosEmOrdem){
  var alvos = [], marcada = null;
  var linha = el("div", "figalvos");
  /* ⚠️ OS ALVOS SAEM EMBARALHADOS — MENOS NA FOLHA DE ORDEM (19/set/2026).
     Embaralhar o alvo é o certo quando ele é uma FIGURA: senão a ordem da lista
     entrega a resposta. Mas numa folha que pede "ponha as cenas na ORDEM" o
     alvo É a ordem — e a tela mostrava 2º, 5º, 1º, 4º, 3º. A criança não tem
     como pôr em ordem uma fila que já está fora de ordem: a folha deixa de
     fazer o que o comando impresso manda. Quem passa `alvosEmOrdem` é a folha
     de ordem, e só ela. */
  (alvosEmOrdem ? alvosHTML.slice(0) : baralha(alvosHTML.slice(0))).forEach(function(A){
    var a = el("div", "figalvo gr");
    a.innerHTML = A.html;
    a.setAttribute("data-alvo", "1");
    a.setAttribute("data-qa", "alvo-" + chaveAlvo + pi + "_" + A.k);
    a._v = A.k; a._dentro = el("div", "fdentro2"); a.appendChild(a._dentro);
    if(A.fala) a.appendChild(botaoSom("Ouvir", function(){ falar(A.fala); }));
    alvos.push(a); linha.appendChild(a);
  });
  d.appendChild(linha);
  var banco = el("div", "figbanco");
  itens.forEach(function(I, i){
    var id = "n" + pi + "_" + i;
    registra(id, pi, ">" + chaveAlvo + pi + "_" + I.alvo);
    var b = el("button", "op pal" + (cls ? " " + cls : "") + (ST.resp[id] ? " usada" : ""), I.rot);
    b.setAttribute("aria-label", I.aria || I.rot);
    b.setAttribute("data-qa", "item-" + id);
    b.setAttribute("data-alvo", "1");
    if(ST.resp[id]) alvos.forEach(function(a){ if(a._v === I.alvo) a._dentro.appendChild(el("span", "fdentro", I.rot)); });
    function larga(a){
      if(ST.resp[id]) return;
      if(a._v === I.alvo){
        b.className = "op pal" + (cls ? " " + cls : "") + " usada";
        a._dentro.appendChild(el("span", "fdentro", I.rot));
        if(marcada === b) marcada = null;
        acertou(id, "certo" + pi + "_" + I.k);
      } else {
        a.className = "figalvo gr erro";
        setTimeout(function(){ a.className = "figalvo gr"; }, 500);
        errou(id, "dica" + pi + "_" + I.k);
      }
    }
    b._larga = larga;
    b.onclick = function(){
      if(b._arrastou){ b._arrastou = false; return; }
      if(ST.resp[id]) return;
      sPasso(); falar(falaItem(I));
      if(marcada === b){ b.className = "op pal" + (cls ? " " + cls : ""); marcada = null; return; }
      if(marcada) marcada.className = "op pal" + (cls ? " " + cls : "");
      b.className = "op pal" + (cls ? " " + cls : "") + " marcada"; marcada = b;
    };
    puxavel(b, alvos, function(a){ larga(a); });
    banco.appendChild(b);
  });
  alvos.forEach(function(a){ a.onclick = function(){ if(marcada && marcada._larga) marcada._larga(a); }; });
  d.appendChild(banco);
}

/* ============================================================
   AS 35 FOLHAS — e a ordem É a escada (ver o comentário dos DADOS).

   ⚠️ O gesto de cada folha saiu do COMANDO IMPRESSO na folha de papel, e o
      comando está copiado verbatim no `_sequencias/POTE-NOT2.md`, ao lado do
      veredito de cada uma das quarenta. Exemplos: *"ARRASTE OS NOMES DAS PARTES
      DA NOTÍCIA ATÉ OS LOCAIS ADEQUADOS"* (d01) → arrastar; *"RECORTE AS
      LEGENDAS ABAIXO, RECORTE E COLE NO LUGAR CERTO"* (d36) → puxar e soltar;
      *"VAMOS ESCOLHER UMA MANCHETE PARA ESSA FOTOLEGENDA?"* (d11) → escolher com
      a foto na frente.
   ============================================================ */

function chavePal(w){
  return String(w).toLowerCase()
    .replace(/[áàâãä]/g, "a").replace(/[éèêë]/g, "e").replace(/[íìîï]/g, "i")
    .replace(/[óòôõö]/g, "o").replace(/[úùûü]/g, "u").replace(/ç/g, "c")
    .replace(/[^a-z]/g, "");
}
function opsPal(ws){
  return baralha(ws.map(function(w){
    return {v: chavePal(w), rot: w, aria: w, fala: "pal_" + chavePal(w)};
  }));
}

/* ---------- a folha de PERGUNTA (o molde da d13 e da d38) ----------
   `comFig` põe a FOTO em cima da pergunta; `comTxt` põe a notícia curta. */
function montaPerg(d, pi, DP, comFig, comTxt){
  ST.folha["p" + pi].forEach(function(k, i){
    var X = DP[k], id = "n" + pi + "_" + i, box = item(i + 1);
    if(comFig && X.fig) box.appendChild(el("div", "cena1", figOu(X.fig, "figacao")));
    if(comTxt && X.t){
      var t = el("div", "fala");
      t.appendChild(el("span", "", X.t));
      box.appendChild(t);
      var ln = el("div", "enunlin");
      ln.appendChild(el("div", "ajuda", "Escute a notícia de novo se precisar."));
      ln.appendChild(botaoSom("Ouvir a notícia", function(){ falar("not_" + k); }));
      box.appendChild(ln);
    }
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "legfig", X.f));
    lin.appendChild(botaoSom("Ouvir a pergunta", function(){ falar("prg_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id, opsPal(X.ops), chavePal(X.r), "pal frase",
           "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}
/* a frase como fila de letras tocáveis — a peça nova deste caderno */
function letraFrase(ch, cls){
  var b = el("button", "lfr" + (cls ? " " + cls : ""), ch);
  b.setAttribute("aria-label", "letra " + ch);
  return b;
}
/* a tira de figuras da frase (uma por palavra que tem desenho) */
function figurasDaFrase(figs){
  var tira = el("div", "tirafig"), k;
  for(k = 0; k < figs.length; k++) tira.innerHTML += img("jq_" + figs[k] + ".png", "figfrase");
  return tira;
}
function ouvirFrase(chave, rot){
  var b = el("button", "bt ouvirped", rot || "Escutar a frase");
  b.onclick = function(){ sPasso(); falar("frz_" + chave); };
  return b;
}
/* onde COMEÇAM as palavras 2, 3, 4… dentro da frase colada */
function cortesDe(txt){
  var ps = txt.split(" "), pos = [], n = 0, k;
  for(k = 0; k < ps.length - 1; k++){ n += ps[k].length; pos.push(n); }
  return pos;
}
function colada(txt){ return txt.split(" ").join(""); }

/* ---------- CORTAR A FRASE — a peça central deste caderno ----------
   ⚠️ ADAPTADA DO `_fra1` (A Tecla do Espaço Quebrou, 1º ano): lá ela recebia o
      índice do nome da folha e montava as falas com ele; aqui a fala é por
      FRASE (`frcerto_<chave>`, `frdica_<chave>`), porque a mesma frase pode
      aparecer em mais de uma folha e gravar a voz duas vezes seria desperdício —
      e, pior, deixaria duas versões do mesmo texto para desencontrar. */
function cortaFrase(d, pi, L, texto){
  /* ⚠️⚠️ O ID NASCE DA POSIÇÃO — `n<pi>_<i>`, como em todo o resto do caderno.
     No `_fra1`, de onde esta peça veio, ela gravava `e1_0`, `e2_0`… com uma
     etiqueta própria, porque LÁ o `idsDaPagina` era outro. Trazida para cá sem
     tocar nisso, ela passou no `conta_folha` (que conta, não compara nome) e
     estourou no jogador: as dez folhas de cortar davam "não conheço a peça".
     E o estrago de verdade não era o portão — era o RELATÓRIO DO PROFESSOR,
     que lê os ids pelo `idsDaPagina` e teria saído ZERO nessas dez folhas com
     o caderno inteiro respondido. É o defeito que o comentário do esqueleto
     avisa em maiúsculas, e eu o repeti na primeira peça que clonei. */
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, texto, "p" + pi + "enun");
  for(var i = 0; i < L.length; i++){
    (function(chave, i){
      var id = "n" + pi + "_" + i, box = item(i + 1);
      var txt = FRASES[chave][0], figs = FRASES[chave][1];
      var cola = colada(txt), cortes = cortesDe(txt), pronto = !!ST.resp[id];
      registra(id, pi, txt);
      if(figs.length) box.appendChild(figurasDaFrase(figs));
      box.appendChild(ouvirFrase(chave));
      var fila = el("div", "frasefila"), achados = {}, quantos = 0, k;
      for(k = 0; k < cola.length; k++){
        (function(k){
          var cortavel = cortes.indexOf(k) > -1;
          var b = letraFrase(cola.charAt(k), pronto && cortavel ? "cortada" : "");
          b.setAttribute("data-qa", "lfr-" + id + "-" + k);
          b.onclick = function(){
            if(ST.resp[id]) return;
            if(!cortavel || achados[k]){
              sErro(); b.className = "lfr fora";
              setTimeout(function(){ b.className = "lfr"; }, 460);
              errou(id, "frdica_" + chave); return;
            }
            sTecla(); b.className = "lfr cortada";
            achados[k] = 1; quantos++;
            if(quantos === cortes.length){
              /* ⭐ O PRÊMIO É VER A FRASE SE SEPARAR e ouvi-la lida com os
                 espaços no lugar. É aí que o conceito aparece — depois do
                 conserto, nunca antes dele (Portão 0 da filosofia da casa). */
              fila.className = "frasefila aberta";
              falar("frz_" + chave);
              setTimeout(function(){ acertou(id, "frcerto_" + chave); }, 1400);
            }
          };
          fila.appendChild(b);
        })(k);
      }
      if(pronto) fila.className = "frasefila aberta";
      box.appendChild(fila);
      box.appendChild(el("div", "contafr", cortes.length + (cortes.length === 1
        ? " corte para achar" : " cortes para achar")));
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* ============================================================
   AS 35 FOLHAS — O CADERNO DO JUQUINHA (2º ano, segmentação)

   ⭐ O PROBLEMA VEM PRIMEIRO E O CONCEITO POR ÚLTIMO (Portão 0 da filosofia da
      casa, e a lacuna de curiosidade de Loewenstein). O caderno não abre
      dizendo "hoje vamos aprender que as palavras se separam por espaços".
      Abre com o caderno do Juquinha, que escreveu tudo grudado e precisa
      entregar amanhã. A criança é quem conserta; o conceito ela descobre no
      meio do conserto.
   ⚠️ O Juquinha é da folha d30: *"Juquinha escreveu várias frases para levar na
      escola, mas ele não sabe escrever direito. Ele grudou todas as palavras."*
      O personagem é da folha de papel, não meu.

   ⚠️ E ESTE CADERNO NÃO É O DO 1º ANO. "A Tecla do Espaço Quebrou" já corta a
      frase grudada e conta palavras. O degrau daqui está na palavra "ESCREVER"
      da habilidade: a criança escreve (folhas 9, 10, 14, 25, 29, 31, 32),
      segmenta TEXTO e não frase solta (16 a 21), e enfrenta o erro que o 1º ano
      não tem — a palavra PARTIDA AO MEIO (12 a 15). Ver `POTE-SEG2.md`.
   ============================================================ */

/* ---------- 1, 2, 3 — CORTAR, o bloco de abertura ----------
   ⚠️ AS TRÊS SEGUIDAS, subindo um degrau (regra do Marcos: mecânica que repete
      vem em BLOCO COLADO, nunca espalhada). O que sobe não é a mecânica: é o
      TAMANHO da frase, que é carga de memória. */
function f1(d, pi){ cortaFrase(d, pi, ST.folha.p1,
  "O Juquinha escreveu tudo grudado! Toque na letra que <b>começa</b> cada palavra nova."); }
function f2(d, pi){ cortaFrase(d, pi, ST.folha.p2,
  "Mais frases do caderno dele. Ache <b>todos</b> os começos."); }
function f3(d, pi){ cortaFrase(d, pi, ST.folha.p3,
  "Agora as compridas. <b>Escute</b> a frase antes de cortar — ajuda muito."); }

/* ---------- 4 e 5 — AS GAVETAS DA LISTA (d31) ---------- */
function f4(d, pi){ gavetas(d, pi, "gA", "A mãe do Juquinha fez a lista da festa. Guarde cada coisa na gaveta dela: é <b>doce</b> ou é <b>salgado</b>?"); }
function f5(d, pi){ gavetas(d, pi, "gA", "O resto da lista. Mesma coisa: cada palavra na sua gaveta."); }

/* ---------- 6 — QUAL ESTÁ ESCRITA CERTA? ---------- */
function montaEscolha(d, pi, DE, pref){
  /* ⚠️ O VALOR DA OPÇÃO É UMA CHAVE CURTA (`o0`, `o1`, `o2`), NUNCA A FRASE.
     Duas razões, e as duas foram medidas em 19/set/2026:
     1. o `data-qa` sai `op-n6_0-O BOLO É DE BANANA`, com espaços e acentos
        dentro do atributo — e o jogador da banca, que monta o seletor a partir
        da resposta declarada, partia a frase nos espaços e procurava CINCO
        botões. Ele dizia "não conheço a peça" nas folhas 6 e 33, que estavam
        certas. Régua errada, folha boa;
     2. a resposta declarada deixaria de ser opaca, e o `_qa/resposta_impressa.py`
        existe justamente para impedir que a resposta apareça escrita na tela. */
  ST.folha["p" + pi].forEach(function(k, i){
    var E = DE[k], id = "n" + pi + "_" + i, box = item(i + 1), certa = "";
    box.appendChild(botaoSom("Ouvir a frase", function(){ falar(pref + k); }));
    var lista = E.ops.map(function(o, j){
      if(o === E.certa) certa = "o" + j;
      return {v: "o" + j, rot: o, aria: o, fala: pref + "op_" + chavePal(o)};
    });
    opcoes(box, pi, id, lista, certa, "frase",
           "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}
function f6(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Duas escritas da mesma frase. Toque na que tem os <b>espaços</b> no lugar.", "p" + pi + "enun");
  montaEscolha(d, pi, GRUDA, "gru_");
}

/* ---------- 7, 8, 19 e 28 — ORDENAR AS PALAVRAS (d12, d26, d33) ----------
   ⚠️ `alvosEmOrdem = true`: as posições aparecem em ordem (1ª, 2ª, 3ª…). Se as
      posições viessem embaralhadas, a folha viraria um quebra-cabeça de
      posições, e não a leitura da frase — que é o que ela mede. */
function montaOrdena(d, pi, DO, pref){
  var lista = ST.folha["p" + pi];
  pegaSolta(d, pi,
    lista.map(function(k){ return {k: k, html: '<span class="cartex">' + DO[k].pos + "</span>",
                                   fala: pref + "pos_" + k}; }),
    baralha(lista.slice(0)).map(function(k){ return {k: k, alvo: k, rot: DO[k].v, aria: DO[k].v}; }),
    "or" + pi, function(I){ return pref + "v_" + I.k; }, "frase", true);
}
function f7(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "As palavras do convite caíram fora de ordem. Leve cada uma para o lugar dela.", "p" + pi + "enun");
  montaOrdena(d, pi, ORD1, "o1_");
}
function f8(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Outro convite embaralhado. Repare nas palavrinhas pequenas: elas também têm lugar.", "p" + pi + "enun");
  montaOrdena(d, pi, ORD2, "o2_");
}
function f19(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Os versos da cantiga estão fora de ordem. Ponha do primeiro ao último.", "p" + pi + "enun");
  montaOrdena(d, pi, ORDV, "ov_");
}
function f28(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "A última frase do bilhete. Ponha cada palavra no lugar dela.", "p" + pi + "enun");
  montaOrdena(d, pi, ORD3, "o3_");
}

/* ---------- 9 e 10 — A FIGURA VIRA PALAVRA (d19) ---------- */
function montaRebus(d, pi){
  ST.folha["p" + pi].forEach(function(k, i){
    var R = REBUS[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasegrande",
      esch(R.antes) + figOu(R.fig, "figlig") + esch(R.depois)));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("reb_" + k); }));
    box.appendChild(lin);
    box.appendChild(el("div", "ajuda cent", "Escreva a palavra que a figura diz."));
    gradeEscrever(box, id, pi, k, R.w, "Escreva a palavra");
    fechaItem(d, box, id);
  });
}
function f9(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "A figura está no lugar de uma palavra. <b>Escreva</b> essa palavra — as casinhas dizem quantas letras tem.", "p" + pi + "enun");
  montaRebus(d, pi);
}
function f10(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Mais figuras no lugar da palavra. Escreva sem deixar letra de fora.", "p" + pi + "enun");
  montaRebus(d, pi);
}

/* ---------- 11 — LIGAR A FRASE À FIGURA (d18) ---------- */
function f11(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Toque numa figura e depois na frase que fala dela.", "p" + pi + "enun");
  var pares = ST.folha["p" + pi][0].map(function(k){
    var L = LIGF[k];
    return {k: k, esq: figOu(L.fig, "figlig"), dir: L.b, ariaE: L.n, ariaD: L.b,
            fe: "figl_" + k, fd: "ligd_" + k,
            fc: "certo" + pi + "_" + k, dica: "dica" + pi + "_" + k};
  });
  /* ⚠️ SEM EMBRULHO: o `montaLigar` recebe a PÁGINA direto. Antes havia um
     um <div> de embrulho com classe própria no meio, que nunca teve uma linha
     de CSS — um <div>
     de nada. O `_qa/classes.py`, depois que passou a ler o `folhas.js`
     (20/set/2026), acusou `.ligcx` em cinco cadernos; a resposta certa não era
     inventar uma regra para ele, era tirar o embrulho. O `_corpo5`, que nasceu
     do esqueleto novo, já fazia assim. */
  montaLigar(d, pi, "g0", pares, d);
}

/* ---------- 12, 13 — A PALAVRA PARTIDA AO MEIO ⭐ O BLOCO NOVO ----------
   ⚠️ DECLARADO: nenhuma das quarenta folhas colhidas trata disto. Elas só têm o
      erro de GRUDAR. O currículo pede "segmentar CORRETAMENTE ao escrever", e
      o erro de PARTIR ("a gora", "com migo") é a outra metade — é o que a
      criança de sete anos faz no caderno dela. Ver `POTE-SEG2.md`. */
function f12(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Cuidado: às vezes o erro é o contrário! Uma palavra <b>sozinha</b> foi partida ao meio. Toque na que está certa.", "p" + pi + "enun");
  montaEscolha(d, pi, ESCPART, "prt_");
}
function f13(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Mais palavras que não se partem. Escute as duas antes de escolher.", "p" + pi + "enun");
  montaEscolha(d, pi, ESCPART, "prt_");
}

/* ---------- 14 — JUNTE A PALAVRA PARTIDA (escrever) ----------
   ⚠️ SÓ AS CINCO SEM ACENTO: o teclado da casa não tem acento, e o que esta
      folha mede é o espaço, não o til. TAMBÉM e AMANHÃ ficam nas de escolher. */
function f14(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "O Juquinha partiu a palavra ao meio. <b>Escreva</b> ela junto, do jeito certo.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var P = PARTIDAS[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasegrande", "<s>" + esch(P.errada) + "</s>"));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("jun_" + k); }));
    box.appendChild(lin);
    box.appendChild(el("div", "ajuda cent", "É uma palavra só. Escreva ela inteira."));
    gradeEscrever(box, id, pi, k, P.certa, "Escreva a palavra");
    fechaItem(d, box, id);
  });
}

/* ---------- 15 — GRUDOU OU PARTIU? ⭐ o degrau mais alto ---------- */
function f15(d, pi){ gavetas(d, pi, "gB", "Agora os dois erros juntos. Este aqui <b>grudou</b> o que era separado, ou <b>partiu</b> o que era uma palavra só?"); }

/* ---------- 16, 18, 20 — SEGMENTAR UM TEXTO, verso a verso ----------
   ⚠️ TEXTO, E NÃO FRASE SOLTA — e é isto que o currículo do 2º ano pede a mais
      ("ao escrever frases E TEXTOS"). Quatro versos seguidos são outro trabalho:
      a criança perde o fio no terceiro, e é ali que ela erra. */
function f16(d, pi){ cortaFrase(d, pi, ST.folha.p16,
  "A parlenda da galinha, verso por verso. Corte cada um."); }
function f18(d, pi){ cortaFrase(d, pi, ST.folha.p18,
  "Agora uma cantiga: <b>O cravo brigou com a rosa</b>. Corte os quatro versos."); }
function f20(d, pi){ cortaFrase(d, pi, ST.folha.p20,
  "A última cantiga. Você já sabe: onde começa a palavra nova?"); }

/* ---------- 17 e 30 — MARCAR NO TEXTO (d30, d22) ---------- */
function f17(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Leia a parlenda e toque " + TXT.tx1.pede + ". Depois confira.", "p" + pi + "enun");
  noTexto(d, pi, TXT.tx1, "certo" + pi + "_t", "dica" + pi + "_t");
}
function f30(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Nesta cantiga, toque " + TXT.tx2.pede + ". Depois confira.", "p" + pi + "enun");
  noTexto(d, pi, TXT.tx2, "certo" + pi + "_t", "dica" + pi + "_t");
}

/* ---------- 21 — QUANTAS PALAVRAS TEM O VERSO ----------
   ⚠️ O "O" E O "A" CONTAM, e é exatamente isto que se mede: a criança de sete
      anos gruda a palavrinha de uma letra no vizinho porque ela é pequena
      demais para parecer palavra. */
function f21(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Conte as palavras do verso. <b>O</b> e <b>A</b> também são palavras!", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var C = CONTA[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasegrande", esch(C.f)));
    lin.appendChild(botaoSom("Ouvir o verso", function(){ falar("cnt_" + k); }));
    box.appendChild(lin);
    var ns = [C.n - 1, C.n, C.n + 1].filter(function(v){ return v > 0; });
    opcoes(box, pi, id, baralha(ns.slice(0)).map(function(v){
      return {v: String(v), rot: String(v), aria: String(v) + " palavras",
              fala: "num_" + v};
    }), String(C.n), "", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* ---------- 22 — A PALAVRA DENTRO DA PALAVRA (d34, Chico Buarque) ---------- */
function f22(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Dentro desta palavra mora outra. Marque as <b>letras</b> da palavra escondida e confira.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var N = DENTRO[k], id = "n" + pi + "_" + i, box = item(i + 1);
    box.appendChild(botaoSom("Ouvir a palavra", function(){ falar("den_" + k); }));
    var pecas = [], j;
    for(j = 0; j < N.p.length; j++){
      (function(j){
        pecas.push({k: "L" + j, t: N.p.charAt(j),
                    ok: j >= N.de && j < N.de + N.dentro.length,
                    fala: function(){ falar("den_" + k); }});
      })(j);
    }
    marqueConfira(box, id, pi, pecas, "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* ---------- 23 — QUAL PALAVRA ESTÁ ESCONDIDA? ---------- */
function f23(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Qual destas palavras está escondida <b>dentro</b> da palavra grande?", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var N = DENTRO[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "palgrande", esch(N.p)));
    lin.appendChild(botaoSom("Ouvir a palavra", function(){ falar("den_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id, N.ops.map(function(o){
      return {v: o, rot: o, aria: o, fala: "opd_" + chavePal(o)};
    }), N.dentro, "", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* ---------- 24 e 25 — A GRADE E A CRUZADINHA ---------- */
function f24(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Ache na grade a palavra que a pista descreve: toque na <b>primeira</b> letra e depois na <b>última</b>.", "p" + pi + "enun");
  cacaPalavras(d, pi, CACA, "Ache a palavra");
}
function f25(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "As palavrinhas que mais grudam. Toque numa pista, escute e escreva. Na grade não há acento.", "p" + pi + "enun");
  cruzadinha(d, pi, CRZD, "crz_");
}

/* ---------- 26, 27, 34, 35 — O BILHETE E O MURAL ---------- */
function f26(d, pi){ cortaFrase(d, pi, ST.folha.p26,
  "O Juquinha escreveu um bilhete para a professora. Conserte para ela poder ler."); }
function f27(d, pi){ cortaFrase(d, pi, ST.folha.p27,
  "O bilhete continua. Agora sem contar os cortes antes: olhe e corte."); }
function f34(d, pi){ cortaFrase(d, pi, ST.folha.p34,
  "As últimas frases do caderno dele. Você já faz isto sozinho."); }
function f35(d, pi){ cortaFrase(d, pi, ST.folha.p35,
  "O mural da turma. Corte as frases e o caderno do Juquinha fica pronto."); }

/* ---------- 29 — A PALAVRA QUE FALTA (d29) ---------- */
function f29(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Falta uma palavra na frase. Escolha a que cabe no espaço.", "p" + pi + "enun");
  ST.folha["p" + pi].forEach(function(k, i){
    var L = LACUNA[k], id = "n" + pi + "_" + i, box = item(i + 1);
    var lin = el("div", "enunlin");
    lin.appendChild(el("div", "frasegrande",
      esch(L.frase).replace("___", '<i class="lacuna peq"></i>')));
    lin.appendChild(botaoSom("Ouvir a frase", function(){ falar("lac_" + k); }));
    box.appendChild(lin);
    opcoes(box, pi, id, L.ops.map(function(o){
      return {v: o, rot: o, aria: o, fala: "opl_" + chavePal(o)};
    }), L.w, "", "certo" + pi + "_" + k, "dica" + pi + "_" + k);
    fechaItem(d, box, id);
  });
}

/* ---------- 31 e 32 — ESCREVA O NOME DA FIGURA (d18) ---------- */
function montaNomeia(d, pi){
  ST.folha["p" + pi].forEach(function(k, i){
    var N = NOMEIA[k], id = "n" + pi + "_" + i, box = item(i + 1);
    box.appendChild(el("div", "cena1", figOu(N.fig, "figacao")));
    box.appendChild(botaoSom("Ouvir o nome", function(){ falar("nom_" + k); }));
    gradeEscrever(box, id, pi, k, N.w, "Escreva o nome");
    fechaItem(d, box, id);
  });
}
function f31(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Escreva o nome da figura. Uma palavra só, com todas as letras.", "p" + pi + "enun");
  montaNomeia(d, pi);
}
function f32(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Mais nomes. Repare: cada figura é <b>uma</b> palavra.", "p" + pi + "enun");
  montaNomeia(d, pi);
}

/* ---------- 33 — TUDO JUNTO: das três, qual está certa? ⭐ ----------
   ⚠️ TRÊS OPÇÕES, e uma de cada erro: a grudada, a partida e a certa. É a
      revisão espaçada (Roediger, Bjork) do caderno inteiro numa folha só. */
function f33(d, pi){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Três escritas, e só uma está certa. Uma grudou, outra partiu. Ache a boa.", "p" + pi + "enun");
  montaEscolha(d, pi, MIX, "mix_");
}
