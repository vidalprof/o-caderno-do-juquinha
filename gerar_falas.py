# -*- coding: utf-8 -*-
u"""
============================================================
 ESQUELETO — gerador das falas da folha viva

 ⚠️ REGRA DA CASA: o `falas.json` é a VERDADE. Texto escrito aqui = voz gravada.
    Texto mudou = voz regravada (o `entregar.yml` compara o carimbo sha1). É isto
    que acaba com "a tela diz uma coisa e a voz diz outra" — e atividade sem
    `falas.json` NÃO TEM COMO SER CONFERIDA, porque mp3 não se lê.

 ⚠️ UMA FONTE SÓ. As palavras, as frases e os textos moram no bloco
    `/*DADOS-INI*/` do `index.html` e são LIDOS daqui. Nada de segunda lista
    para desencontrar: já custou caro nesta casa um relatório sair zero com a
    folha inteira respondida.

 ⚠️ TODA TELA É NARRADA, e o alto-falante entra também em CADA RESPOSTA que a
    criança toca. Regra do Marcos: *"o alto-falante nas respostas também, para
    ajudar os alunos que não sabem ler"*. Sem isso a criança que ainda soletra
    escolhe pelo tamanho da palavra e a folha vira sorteio.

 ⚠️ A DICA NUNCA DIZ A RESPOSTA. Ela manda olhar uma pista, ou faz outra
    pergunta. Responder no segundo erro não é ajudar: é tirar da criança a única
    chance de pensar de novo.

 ⚠️ PALAVRAS QUE A VOZ ERRA (medido, e o portão `_qa/falas.py` reprova):
    "complete" vira "complite" — usar "preencha". Letra solta ("som S") sai como
    o NOME da letra: ancorar num exemplo ("o som de SAPO").

 Uso:  python3 <pasta>/gerar_falas.py
 Saída: reescreve os blocos FALAS e VOZOK do index.html, o `falas.json` e o
        `voz.txt`.
============================================================
"""
from __future__ import print_function

import collections
import io
import json
import os
import re
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
CAM = os.path.join(AQUI, u"index.html")
PREFIXO = u"jq_"                     # <- o prefixo desta atividade
VOZ = u"pt-BR-AntonioNeural"

D = io.open(CAM, encoding=u"utf-8").read()


def bloco(nome):
    u"""Lê um objeto do bloco DADOS do index.html. Uma fonte só.

    ⚠️ ELE CONTA AS CHAVES, e isso foi conserto de 15/set/2026. O esqueleto
       procurava o fim do objeto por uma marca de texto (`\n});`) — e QUALQUER
       objeto que não terminasse exatamente assim fazia a leitura passar
       adiante e engolir o bloco seguinte. No primeiro caderno do 2º ano os
       vinte e três blocos falharam de uma vez, todos com o mesmo erro, e a
       mensagem do json não dizia nada sobre a causa. Contar chave por chave
       (pulando as que estão DENTRO de texto) acha o fim de qualquer objeto.
    """
    i = D.find(u"var " + nome + u" = ")
    if i < 0:
        raise SystemExit(u"nao achei o bloco `var %s` no index.html" % nome)
    i = D.index(u"{", i)
    nivel, j, dentro, escapa = 0, i, False, False
    while j < len(D):
        c = D[j]
        if dentro:
            if escapa:
                escapa = False
            elif c == u"\\":
                escapa = True
            elif c == u'"':
                dentro = False
        else:
            if c == u'"':
                dentro = True
            elif c == u"{":
                nivel += 1
            elif c == u"}":
                nivel -= 1
                if nivel == 0:
                    j += 1
                    break
        j += 1
    txt = D[i:j]
    txt = re.sub(r"/\*.*?\*/", "", txt, flags=re.S)
    txt = re.sub(r'"\s*\+\s*\n\s*"', "", txt)                 # junta "a" + "b"
    txt = re.sub(r'([\{,]\s*)"?([A-Za-zÀ-ÿ_0-9]+)"?\s*:', r'\1"\2":', txt)
    txt = re.sub(r",(\s*[\}\]])", r"\1", txt)
    return json.loads(txt)


# ⚠️⚠️ A ENTIDADE HTML TAMBÉM É MARCAÇÃO, e isto foi lição paga (15/set/2026,
#    caderno de inglês do 8º ano). O `lp` tirava as TAGS e deixava as
#    ENTIDADES, então a lista de ingredientes da pizza — escrita com `&middot;`
#    para virar o ponto que separa os itens — ia para a fila de gravação como
#    *"Oil and middot Tomato sauce and middot Some onions"*. O portão
#    `_qa/revisor.py` pegou; se não pegasse, a voz teria dito isso à criança.
_ENT = {u"&middot;": u",", u"&nbsp;": u" ", u"&amp;": u" e ", u"&mdash;": u" ",
        u"&ndash;": u" ", u"&hellip;": u" ", u"&quot;": u'"', u"&lt;": u"",
        u"&gt;": u"", u"&#39;": u"'", u"&apos;": u"'"}


def lp(s):
    u"""tira a marcação e deixa o texto do jeito que a voz vai dizer"""
    t = re.sub(r"<[^>]+>", " ", s or u"")
    for _e, _v in _ENT.items():
        t = t.replace(_e, _v)
    t = re.sub(r"\s+", u" ", t)
    # ⚠️ e a tag que vira espaco deixa um vao ANTES da pontuacao ("o cinema ."),
    #    que o `_qa/revisor.py` acusa — com razao: a voz faz a pausa no lugar
    #    errado. Cola a pontuacao de volta na palavra.
    t = re.sub(r"\s+([,.;:!?])", r"\1", t)
    # ⚠️ E A VIRGULA DA PAUSA PODE ENCOSTAR NUMA QUE JA EXISTIA (15/set/2026):
    #    a frase "My dad, ___ travels a lot" virou "My dad,, travels a lot" —
    #    duas virgulas coladas, que o Edge TTS le como uma pausa estranha e
    #    longa demais. Uma so, sempre.
    t = re.sub(r",\s*,+", u",", t)
    return t.strip()


def ch(w):
    return re.sub(r"[^a-z]", "",
                  unicodedata.normalize("NFKD", w.lower())
                  .encode("ascii", "ignore").decode())


F = collections.OrderedDict()


def p(k, v):
    F[k] = v


# ---------------------------------------------------------------------------
# AS FALAS DO MOTOR — estas toda folha viva tem
# ---------------------------------------------------------------------------
p(u"capa", u"O Caderno do Juquinha. Trinta e cinco folhas para consertar as "
           u"frases que ficaram grudadas. Escreva o seu nome ali embaixo e "
           u"toque em Começar.")
p(u"folhaPronta", u"Folha pronta! Muito bem.")
p(u"escreva", u"Escreva a palavra usando o teclado.")
p(u"ligue", u"Toque numa figura do lado esquerdo e depois na frase do lado direito.")
p(u"toque_palavra", u"Primeiro toque numa palavra ali embaixo. Depois toque na "
                    u"gaveta dela.")
p(u"quase", u"Quase! Olhe de novo com calma.")
p(u"cacatoque", u"Toque na primeira letra da palavra e depois na última.")
p(u"novoCaderno", u"Caderno novo! Vamos de novo, do começo.")
p(u"vozOn", u"Narração ligada!")
p(u"fim", u"Você consertou o caderno inteiro do Juquinha! E agora fica a "
          u"pergunta: olhe um bilhete que você mesmo escreveu hoje. Todas as "
          u"palavras estão no lugar delas?")

# ---------------------------------------------------------------------------
# AS FALAS DAS FOLHAS — uma seção por gesto, lendo os DADOS do index.html.
# Uma fonte só: o que está escrito lá é o que a voz diz.
# ---------------------------------------------------------------------------
ELOGIO = [u"Isso mesmo!", u"Muito bem!", u"Você acertou!", u"Boa!", u"Exatamente!",
          u"É isso aí!"]


def elogio(n):
    return ELOGIO[n % len(ELOGIO)]


def frase(s):
    u"""O texto do caderno vem em CAIXA ALTA porque é assim que a criança de
    sete anos lê melhor na tela. A voz, porém, lê caixa alta como SIGLA em
    alguns casos ("A" vira "á", "OS" vira "ó-esse"). Então a fala vai em caixa
    normal, com a primeira letra maiúscula e ponto no fim."""
    t = lp(s).strip()
    if not t:
        return t
    t = t[0].upper() + t[1:].lower()
    return t if t[-1:] in u".!?" else t + u"."


ITENS = bloco(u"ITENS")


def pote(pi):
    v = ITENS[u"p%d" % pi]
    return v[0] if v and isinstance(v[0], list) else v


# --- os 35 enunciados --------------------------------------------------------
ENUN = {
 1: u"Folha um. O Juquinha escreveu tudo grudado. Toque na letra que começa "
    u"cada palavra nova.",
 2: u"Folha dois. Mais frases do caderno dele. Ache todos os começos de palavra.",
 3: u"Folha três. Agora as frases são mais compridas. Escute a frase antes de "
    u"cortar: ajuda muito.",
 4: u"Folha quatro. A mãe do Juquinha fez a lista da festa. Guarde cada coisa "
    u"na gaveta dela: é doce ou é salgado?",
 5: u"Folha cinco. O resto da lista. Cada palavra na sua gaveta.",
 6: u"Folha seis. Duas escritas da mesma frase. Toque na que tem os espaços no "
    u"lugar.",
 7: u"Folha sete. As palavras do convite caíram fora de ordem. Leve cada uma "
    u"para o lugar dela.",
 8: u"Folha oito. Outro convite embaralhado. Repare nas palavrinhas pequenas: "
    u"elas também têm lugar.",
 9: u"Folha nove. A figura está no lugar de uma palavra. Escreva essa palavra. "
    u"As casinhas dizem quantas letras tem.",
 10: u"Folha dez. Mais figuras no lugar da palavra. Escreva sem deixar letra "
     u"de fora.",
 11: u"Folha onze. Toque numa figura e depois na frase que fala dela.",
 12: u"Folha doze. Cuidado: às vezes o erro é o contrário. Uma palavra sozinha "
     u"foi partida ao meio. Toque na que está certa.",
 13: u"Folha treze. Mais palavras que não se partem. Escute as duas antes de "
     u"escolher.",
 14: u"Folha catorze. O Juquinha partiu a palavra ao meio. Escreva ela junto, "
     u"do jeito certo.",
 15: u"Folha quinze. Agora os dois erros juntos. Este aqui grudou o que era "
     u"separado, ou partiu o que era uma palavra só?",
 16: u"Folha dezesseis. A parlenda da galinha, verso por verso. Corte cada um.",
 17: u"Folha dezessete. Leia a parlenda e toque nas palavras que têm só uma "
     u"letra. Depois confira.",
 18: u"Folha dezoito. Agora uma cantiga: o cravo brigou com a rosa. Corte os "
     u"quatro versos.",
 19: u"Folha dezenove. Os versos da cantiga estão fora de ordem. Ponha do "
     u"primeiro ao último.",
 20: u"Folha vinte. A última cantiga. Você já sabe: onde começa a palavra nova?",
 21: u"Folha vinte e um. Conte as palavras do verso. As palavrinhas de uma "
     u"letra também são palavras.",
 22: u"Folha vinte e dois. Dentro desta palavra mora outra. Marque as letras "
     u"da palavra escondida e confira.",
 23: u"Folha vinte e três. Qual destas palavras está escondida dentro da "
     u"palavra grande?",
 24: u"Folha vinte e quatro. Ache na grade a palavra que a pista descreve: "
     u"toque na primeira letra e depois na última.",
 25: u"Folha vinte e cinco. As palavrinhas que mais grudam. Toque numa pista, "
     u"escute e escreva. Na grade não há acento.",
 26: u"Folha vinte e seis. O Juquinha escreveu um bilhete para a professora. "
     u"Conserte para ela poder ler.",
 27: u"Folha vinte e sete. O bilhete continua. Agora olhe e corte.",
 28: u"Folha vinte e oito. A última frase do bilhete. Ponha cada palavra no "
     u"lugar dela.",
 29: u"Folha vinte e nove. Falta uma palavra na frase. Escolha a que cabe no "
     u"espaço.",
 30: u"Folha trinta. Nesta cantiga, toque nas palavras que têm mais de seis "
     u"letras. Depois confira.",
 31: u"Folha trinta e um. Escreva o nome da figura. Uma palavra só, com todas "
     u"as letras.",
 32: u"Folha trinta e dois. Mais nomes. Repare: cada figura é uma palavra.",
 33: u"Folha trinta e três. Três escritas, e só uma está certa. Uma grudou, "
     u"outra partiu. Ache a boa.",
 34: u"Folha trinta e quatro. As últimas frases do caderno dele. Você já faz "
     u"isto sozinho.",
 35: u"Folha trinta e cinco. O mural da turma. Corte as frases e o caderno do "
     u"Juquinha fica pronto.",
}
for _i in range(1, 36):
    p(u"p%denun" % _i, ENUN[_i])

# --- AS FRASES: uma fala por frase, reusada por todas as folhas de cortar ----
# ⚠️ POR FRASE E NÃO POR FOLHA: a mesma frase aparece em mais de uma folha (a1,
#    a2 e a3 voltam na folha 35, que é a revisão). Gravar por folha faria dois
#    mp3 do mesmo texto — desperdício, e duas versões para desencontrar.
FRASES = bloco(u"FRASES")
for _n, (_k, _F) in enumerate(sorted(FRASES.items())):
    p(u"frz_" + _k, frase(_F[0]))
    p(u"frcerto_" + _k, elogio(_n) + u" " + frase(_F[0]))
    p(u"frdica_" + _k, u"Escute a frase de novo e repita em voz alta. Onde a "
                       u"sua voz faz uma paradinha, ali começa a palavra nova.")

# --- 4, 5 e 15: as gavetas ----------------------------------------------------
GAV = bloco(u"GAV")
_GAVTXT = {u"d": u"Gaveta dos doces.", u"s": u"Gaveta dos salgados.",
           u"j": u"Gaveta do que grudou demais.",
           u"r": u"Gaveta do que foi partido demais."}
for _gk, _G in sorted(GAV.items()):
    for _C in _G[u"cols"]:
        p(u"gav_%s_%s" % (_gk, _C[u"k"]), _GAVTXT[_C[u"k"]])
# ⚠️ A EXPLICAÇÃO COMEÇA EM MAIÚSCULA porque vem DEPOIS do ponto final da
#    frase. Em minúscula, sairia "…brigadeiro. é doce" — e o portão 0o
#    (`_qa/revisor.py`) acusa, com razão: a voz faz a pausa e emenda errado.
_GAVCERTO = {u"d": u"É doce.", u"s": u"É salgado.",
             u"j": u"Aqui as palavras ficaram grudadas umas nas outras.",
             u"r": u"Aqui uma palavra só foi partida ao meio."}
_GAVDICA = {u"gA": u"Pense na festa: isto você come no começo, ou é a "
                   u"sobremesa doce do fim?",
            u"gB": u"Conte quantas palavras deveria ter. Se são muitas grudadas "
                   u"numa só, grudou. Se é uma só cortada em duas, partiu."}
for _pi, _gk in ((4, u"gA"), (5, u"gA"), (15, u"gB")):
    for _n, _k in enumerate(pote(_pi)):
        _X = GAV[_gk][u"pal"][_k]
        p(u"diz2_%s_%s" % (_gk, _k), frase(_X[u"p"]))
        p(u"certo%d_%s" % (_pi, _k),
          elogio(_n) + u" " + frase(_X[u"p"]) + u" " + _GAVCERTO[_X[u"c"]])
        p(u"dica%d_%s" % (_pi, _k), _GAVDICA[_gk])

# --- 6, 12, 13 e 33: escolher a escrita certa --------------------------------
_ESCDICA = {
 6: u"Leia as duas em voz alta, devagar. Numa delas as palavras estão coladas "
    u"umas nas outras.",
 12: u"Diga a palavra em voz alta. Se ela sai de uma vez só, sem paradinha no "
     u"meio, é uma palavra só.",
 13: u"Diga a palavra em voz alta. A sua voz para no meio dela, ou vai até o "
     u"fim de uma vez?",
 33: u"Olhe as três com calma. Uma tem palavras coladas, outra tem uma palavra "
     u"cortada ao meio. Sobra uma.",
}
for _pi, _nome, _pref in ((6, u"GRUDA", u"gru_"), (12, u"ESCPART", u"prt_"),
                          (13, u"ESCPART", u"prt_"), (33, u"MIX", u"mix_")):
    _D = bloco(_nome)
    for _n, _k in enumerate(pote(_pi)):
        _X = _D[_k]
        for _o in _X[u"ops"]:
            p(_pref + u"op_" + ch(_o), frase(_o))
        p(_pref + _k, frase(_X[u"certa"]))
        p(u"certo%d_%s" % (_pi, _k), elogio(_n) + u" " + frase(_X[u"certa"]))
        p(u"dica%d_%s" % (_pi, _k), _ESCDICA[_pi])

# --- 7, 8, 19 e 28: ordenar --------------------------------------------------
_ORDDICA = {7: u"Leia as palavras que você já pôs e continue a frase de onde parou.",
            8: u"Comece pela palavra que abriria a frase se você a dissesse em voz alta.",
            19: u"Cante a música na sua cabeça. Qual verso vem depois deste?",
            28: u"Leia do começo o que já está no lugar. A próxima aparece sozinha."}
for _pi, _nome, _pref in ((7, u"ORD1", u"o1_"), (8, u"ORD2", u"o2_"),
                          (19, u"ORDV", u"ov_"), (28, u"ORD3", u"o3_")):
    _D = bloco(_nome)
    for _n, _k in enumerate(pote(_pi)):
        _X = _D[_k]
        p(_pref + u"pos_" + _k, frase(_X[u"pos"]))
        p(_pref + u"v_" + _k, frase(_X[u"v"]))
        p(u"certo%d_%s" % (_pi, _k),
          elogio(_n) + u" " + frase(_X[u"pos"]) + u" " + frase(_X[u"v"]))
        p(u"dica%d_%s" % (_pi, _k), _ORDDICA[_pi])

# --- 9 e 10: a figura vira palavra (rebus) -----------------------------------
REBUS = bloco(u"REBUS")
for _pi in (9, 10):
    for _n, _k in enumerate(pote(_pi)):
        _R = REBUS[_k]
        _inteira = _R[u"antes"] + _R[u"w"] + _R[u"depois"]
        p(u"reb_" + _k, frase(_inteira))
        p(u"certo%d_%s" % (_pi, _k), elogio(_n) + u" " + frase(_inteira))
        p(u"dica%d_%s" % (_pi, _k), u"Conte as casinhas e diga o nome da figura "
                                    u"devagar, letra por letra.")

# --- 11: ligar a figura à frase ----------------------------------------------
LIGF = bloco(u"LIGF")
for _n, _k in enumerate(pote(11)):
    _L = LIGF[_k]
    p(u"figl_" + _k, frase(_L[u"n"]))
    p(u"ligd_" + _k, frase(_L[u"b"]))
    p(u"certo11_" + _k, elogio(_n) + u" " + frase(_L[u"n"] + u" " + _L[u"b"]))
    p(u"dica11_" + _k, u"Olhe a figura e pergunte: o que este bicho faz?")

# --- 14: juntar a palavra partida --------------------------------------------
PARTIDAS = bloco(u"PARTIDAS")
for _n, _k in enumerate(pote(14)):
    _P = PARTIDAS[_k]
    p(u"jun_" + _k, frase(_P[u"certa"]))
    p(u"certo14_" + _k, elogio(_n) + u" " + frase(_P[u"certa"]) + u" É uma "
                        u"palavra só, sem espaço no meio.")
    p(u"dica14_" + _k, u"Diga a palavra em voz alta e escreva o que você ouve, "
                       u"sem parar no meio.")

# --- 17 e 30: marcar no texto -------------------------------------------------
TXT = bloco(u"TXT")
_TXTDICA = {17: u"Vá palavra por palavra e conte as letras de cada uma. Uma só, "
                u"sozinha, também é palavra.",
            30: u"Conte as letras com o dedo. Sete ou mais é mais de seis."}
for _pi, _tk in ((17, u"tx1"), (30, u"tx2")):
    _T = TXT[_tk]
    _nw = 0
    for _lin in _T[u"linhas"]:
        for _w in _lin:
            p(u"tx%d_%d" % (_pi, _nw), _w)
            _nw += 1
    p(u"certo%d_t" % _pi, u"Muito bem! As palavras eram " +
      u", ".join(_T[u"ok"]) + u".")
    p(u"dica%d_t" % _pi, _TXTDICA[_pi])

# --- 21: quantas palavras tem o verso ----------------------------------------
CONTA = bloco(u"CONTA")
_NUM = {1: u"Uma", 2: u"Duas", 3: u"Três", 4: u"Quatro", 5: u"Cinco",
        6: u"Seis", 7: u"Sete", 8: u"Oito"}
for _v in sorted(_NUM):
    p(u"num_%d" % _v, _NUM[_v] + u".")
for _n, _k in enumerate(pote(21)):
    _C = CONTA[_k]
    p(u"cnt_" + _k, frase(_C[u"f"]))
    p(u"certo21_" + _k, elogio(_n) + u" " + _NUM[_C[u"n"]].lower().capitalize() +
      u" palavras: " + frase(_C[u"f"]))
    p(u"dica21_" + _k, u"Aponte cada palavra com o dedo e conte em voz alta. "
                       u"Não pule as pequenininhas.")

# --- 22 e 23: a palavra dentro da palavra ------------------------------------
DENTRO = bloco(u"DENTRO")
for _pi in (22, 23):
    for _n, _k in enumerate(pote(_pi)):
        _N = DENTRO[_k]
        p(u"den_" + _k, frase(_N[u"p"]))
        p(u"certo%d_%s" % (_pi, _k), elogio(_n) + u" Dentro de " +
          _N[u"p"].lower() + u" mora " + _N[u"dentro"].lower() + u".")
        p(u"dica%d_%s" % (_pi, _k), u"Diga a palavra grande devagar e escute os "
                                    u"pedaços. Um deles é uma palavra sozinha.")
        if _pi == 23:
            for _o in _N[u"ops"]:
                p(u"opd_" + ch(_o), frase(_o))

# --- 24: o caça-palavras ------------------------------------------------------
CACA = bloco(u"CACA")
for _n, _k in enumerate(pote(24)):
    _P = CACA[u"pal"][_k]
    p(u"cp_" + _k, _P[u"pista"][0].upper() + _P[u"pista"][1:] + u".")
    p(u"certo24_" + _k, elogio(_n) + u" Achou.")

# --- 25: a cruzadinha ---------------------------------------------------------
CRZD = bloco(u"CRZD")
for _n, _k in enumerate(pote(25)):
    _P = CRZD[_k]
    p(u"crz_" + _k, lp(_P[u"d"])[0].upper() + lp(_P[u"d"])[1:] + u".")
    p(u"certo25_" + _k, elogio(_n) + u" " + _P[u"p"].capitalize() + u".")

# --- 29: a palavra que falta --------------------------------------------------
LACUNA = bloco(u"LACUNA")
for _n, _k in enumerate(pote(29)):
    _L = LACUNA[_k]
    _cheia = _L[u"frase"].replace(u"___", _L[u"w"])
    # ⚠️ A LACUNA NÃO SE NARRA COM RETICÊNCIAS SOLTAS (regra da casa,
    #    `SEQUENCIAS-DIDATICAS §2c`): a voz lê "O... corre solto" com a
    #    frase começando em minúscula depois do ponto, e o portão 0o
    #    acusou quatro falas de uma vez. A fala PERGUNTA o que falta, que
    #    é como um adulto leria em voz alta para a criança completar.
    p(u"lac_" + _k, u"Qual palavra falta aqui? " +
      frase(_L[u"frase"].replace(u"___", u"\u2014")))
    for _o in _L[u"ops"]:
        p(u"opl_" + ch(_o), frase(_o))
    p(u"certo29_" + _k, elogio(_n) + u" " + frase(_cheia))
    p(u"dica29_" + _k, u"Leia a frase inteira com cada palavra e escute qual "
                       u"delas faz sentido.")

# --- 31 e 32: escrever o nome da figura ---------------------------------------
NOMEIA = bloco(u"NOMEIA")
for _pi in (31, 32):
    for _n, _k in enumerate(pote(_pi)):
        _N = NOMEIA[_k]
        p(u"nom_" + _k, frase(_N[u"w"]))
        p(u"certo%d_%s" % (_pi, _k), elogio(_n) + u" " + frase(_N[u"w"]))
        p(u"dica%d_%s" % (_pi, _k), u"Conte as casinhas e diga o nome devagar, "
                                    u"letra por letra.")


# ==============================================================================
#  AS SÍLABAS FALADAS — e este bloco é obrigatório em caderno que fale sílaba
#
#  ⚠️⚠️ POR QUE NÃO DÁ PARA SINTETIZAR A SÍLABA SOLTA (e a casa já pagou por
#     isto DUAS vezes — set/2026 e 16/set/2026, as duas o Marcos ouvindo):
#     a voz não lê SOM, lê PALAVRA. Entregue "SA" a ela e ela soletra "esse-á";
#     "VA" vira "vê-á"; "ÇÃ" ela nem tenta, porque ç não começa palavra em
#     português. Escrever a sílaba "como se fala" conserta UM caso e nunca
#     fecha a família.
#
#  O QUE FUNCIONA é o contrário: gravar a PALAVRA INTEIRA — que a voz pronuncia
#  certo, porque é palavra de verdade — alinhar letra a letra com o
#  `ctc-forced-aligner` e CORTAR a sílaba de dentro dela. Quem faz isso é o
#  `_padrao/silabas_voz.py`, dentro do `entregar.yml`, lendo o `silabas.json`
#  que sai daqui. O portão é o `_qa/silabas.py`.
#
#  COMO SE USA: para cada palavra do caderno, uma linha
#      _reg(u"CAVALO", [u"CA", u"VA", u"LO"])
#  e, no app, a sílaba fala por `falarSilaba(null, 0, "VA")` — nunca por
#  `falar("sil_va")`. Caderno que não fala sílaba não escreve nada: o
#  `silabas.json` sai com `"palavras": {}` e o `entregar.yml` nem baixa o
#  alinhador por ele.
#
#  ⚠️ NÃO HÁ FALA DE RESERVA POR SÍLABA. Faltando o recorte, o app diz a
#     PALAVRA INTEIRA. Uma reserva sintetizada seria o defeito voltando pela
#     porta dos fundos — e calado, que é pior.
# ==============================================================================
_SIL_DE = {}          # palavra -> [sílabas, NA ORDEM da palavra]
_MAPA_SIL = {}        # sílaba  -> [palavra, posição]
_RECUSADAS = []


def _reg(palavra, silabas):
    u"""⚠️ A LISTA TEM DE ESTAR NA ORDEM DA PALAVRA. O alinhador corta pelos
    limites das letras: ["RO","CAR"] para CARRO faz sair "ro" onde devia sair
    "car" — e a criança ouve o pedaço errado, sem erro nenhum na tela. Folha de
    ORDENAR guarda as sílabas EMBARALHADAS: passe-as por `_ordena` antes.
    ⚠️ E ganha sempre a partição MAIS FINA: "PIPO"+"CA" fecha PIPOCA sem ser
    separação silábica, e sobrescrevendo PI-PO-CA deixaria a sílaba PI muda."""
    silabas = list(silabas)
    if u"".join(silabas).upper() != palavra.upper():
        _RECUSADAS.append((palavra, silabas))
        return
    velha = _SIL_DE.get(palavra.lower())
    if velha and len(velha) >= len(silabas):
        return
    _SIL_DE[palavra.lower()] = silabas


def _ordena(palavra, embaralhadas):
    u"""as mesmas sílabas na ORDEM em que formam a palavra — sem inventar
    nenhuma: encaixa da esquerda para a direita e desiste se não fechar."""
    resto, saida, alvo = list(embaralhadas), [], palavra.upper()
    while alvo:
        for _i, _sb in enumerate(resto):
            if alvo.startswith(_sb.upper()):
                saida.append(_sb)
                alvo = alvo[len(_sb):]
                resto.pop(_i)
                break
        else:
            return None
    return saida if not resto else None


def _achaSilaba(s):
    u"""a palavra de onde a sílaba será recortada. Ganha a MAIS CURTA: menos
    letras na gravação, menos lugar para o alinhador errar."""
    cand = [_w for _w in sorted(_SIL_DE) if s in _SIL_DE[_w]]
    if not cand:
        return None
    _w = min(cand, key=lambda w: (len(_SIL_DE[w]), len(w), w))
    return [_w, _SIL_DE[_w].index(s)]


def _mapeia(soltas):
    u"""monta o SILMAP das sílabas que o app fala sozinhas, e DEVOLVE as órfãs.
    ⚠️ Sílaba órfã não é erro — o app diz a palavra inteira — mas tem de sair
    IMPRESSA, senão aquele botão emudece sem ninguém saber. Distratora que não
    mora em palavra nenhuma do caderno pede uma PALAVRA-CARREGADORA: uma
    palavra de verdade, curta, registrada só para ser gravada e cortada."""
    orfas = []
    for _s in sorted(set(soltas)):
        _achou = _achaSilaba(_s)
        if _achou:
            _MAPA_SIL[_s] = _achou
        else:
            orfas.append(_s)
    # e a PALAVRA INTEIRA de cada uma precisa existir como fala: é dela que o
    # recorte sai, e é ela que o app diz quando o recorte falta.
    for _w in sorted(_SIL_DE):
        p(u"pal_" + ch(_w), _w.upper() + u".")
    return orfas


_ORFAS = _mapeia([])          # <- passe aqui TODA sílaba que o app fala sozinha


# ---------------------------------------------------------------------------
# A SAÍDA
# ---------------------------------------------------------------------------
def chave(s):
    u"""O nome do mp3 sai do TEXTO, não da chave da fala — assim duas chaves que
    dizem a mesma frase gravam um arquivo só."""
    s = re.sub(r"\s+", u" ", s or u"").strip().lower()
    hh = 5381
    for c in s:
        hh = ((hh * 33) ^ ord(c)) & 0xFFFFFFFF
    d, out = hh, u""
    if d == 0:
        return u"0"
    while d:
        out = u"0123456789abcdefghijklmnopqrstuvwxyz"[d % 36] + out
        d //= 36
    return out


falas, vistos = [], {}
for k in sorted(F.keys()):
    txt = F[k]
    if not txt:
        continue
    c = chave(txt)
    if c in vistos:
        continue
    vistos[c] = 1
    falas.append({u"id": PREFIXO + c, u"texto": txt, u"voz": VOZ})

html = io.open(CAM, encoding=u"utf-8").read()
blocoF = (u"/*FALAS-INI*/\nvar FALAS = "
          + json.dumps(F, ensure_ascii=False, indent=1, sort_keys=True) + u";\n/*FALAS-FIM*/")
blocoV = (u"/*VOZOK-INI*/var VOZOK = "
          + json.dumps(dict((c, 1) for c in vistos), ensure_ascii=False) + u";/*VOZOK-FIM*/")
novo = re.sub(r"/\*FALAS-INI\*/.*?/\*FALAS-FIM\*/", lambda m: blocoF, html, flags=re.S)
novo = re.sub(r"/\*VOZOK-INI\*/.*?/\*VOZOK-FIM\*/", lambda m: blocoV, novo, flags=re.S)

# ⭐ o `silabas.json` é o que o `entregar.yml` lê para cortar cada sílaba de
#    dentro do mp3 da palavra inteira, e o `SILMAP` é o que o app usa para saber
#    de qual palavra veio cada pedaço. Uma fonte só para os dois.
io.open(os.path.join(AQUI, u"silabas.json"), u"w", encoding=u"utf-8").write(
    json.dumps({u"prefixo": PREFIXO, u"voz": VOZ,
                u"palavras": dict((w, _SIL_DE[w]) for w in sorted(_SIL_DE))},
               ensure_ascii=False, indent=1))
blocoS = (u"/*SILMAP-INI*/var SILMAP = "
          + json.dumps(_MAPA_SIL, ensure_ascii=False, sort_keys=True) + u";/*SILMAP-FIM*/")
novo = re.sub(r"/\*SILMAP-INI\*/.*?/\*SILMAP-FIM\*/", lambda m: blocoS, novo, flags=re.S)
io.open(CAM, u"w", encoding=u"utf-8").write(novo)
io.open(os.path.join(AQUI, u"falas.json"), u"w", encoding=u"utf-8").write(
    json.dumps(falas, ensure_ascii=False, indent=1))
io.open(os.path.join(AQUI, u"voz.txt"), u"w", encoding=u"utf-8").write(VOZ + u"\n")
print(u"FALAS: %d chaves; falas.json: %d fala(s) para gravar; "
      u"silabas: %d palavra(s) para recortar, %d silaba(s) no mapa"
      % (len(F), len(falas), len(_SIL_DE), len(_MAPA_SIL)))
if _ORFAS:
    print(u"   \u26a0\ufe0f %d silaba(s) SEM palavra de origem (o app dira a palavra "
          u"inteira): %s" % (len(_ORFAS), u", ".join(_ORFAS)))
if _RECUSADAS:
    print(u"   \u26a0\ufe0f %d lista(s) recusada(s) por nao formarem a palavra: %s"
          % (len(_RECUSADAS), u", ".join(
              u"%s=%s" % (w, u"-".join(sl)) for w, sl in _RECUSADAS[:8])))
