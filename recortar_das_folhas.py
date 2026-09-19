# -*- coding: utf-8 -*-
u"""
============================================================
 RECORTAR AS FIGURAS DAS FOLHAS DE PAPEL — O Caderno do Juquinha (2º ano)

 ⭐ A REGRA QUE MANDA AQUI (Marcos, 14/set/2026): *"procure na internet, nada de
    imagem gerada por IA, utilize das atividades"*. Toda figura deste caderno
    sai das quarenta folhas colhidas em `_sequencias/folhas_seg2` — as mesmas
    que a professora dá no papel.

 De onde vem cada família, e por que foram estas três folhas entre as quarenta:

   · d02 — *"SEGMENTE AS FRASES, OBSERVANDO OS ESPAÇOS ENTRE AS PALAVRAS."*
     Cinco bichos coloridos, um por frase, e as frases vêm junto
     (ATARTARUGAANDADEVAGAR, AJOANINHAÉPINTADINHA…). Figura e frase nasceram na
     mesma folha, que é o ponto da regra: a criança reconhece a atividade.
   · d19 — *"SUBSTITUA AS IMAGENS PELAS PALAVRAS QUE AS NOMEIAM E REESCREVA AS
     FRASES."* É a folha do REBUS, e por isso as figuras dela são maiores e
     limpas: na folha de papel elas ocupam o lugar de uma palavra dentro da
     frase, que é exatamente o que fazem na tela.

 ⛔ O QUE FICOU DE FORA, e o motivo de cada uma:
   · **d10** (Halloween) — eu CHEGUEI A RECORTAR as cinco e desisti olhando a
     folha de contato: são desenhos a traço preto e, ao lado das doze
     coloridas, o caderno ficaria com duas famílias de arte. ⭐ **As cinco
     frases dela entram assim mesmo, sem figura** — a frase veio do papel, que
     é o que a regra da origem protege; nem toda frase precisa de desenho, e
     figura só para preencher é enfeite.
   · **d05** — seis coloridas e bonitas, mas com 70 px de altura. Na tela elas
     seriam AMPLIADAS, e ampliar é justamente o que a regra de resolução do
     `_qa/leiaute_mao.js` existe para impedir (medido em 14/set: 23 figuras dos
     Cinco Reinos apareciam até 2,95× maiores que o arquivo, e era daí que vinha
     o borrão).
   · **d36** — as figuras do rebus em traço preto, sem cor.
   · **d13** e **d26** — figuras boas, com assinatura de blog atravessada.

 ⚠️ E O NOME TEM DE BATER COM O DESENHO. Cada nome abaixo foi conferido OLHANDO
    a folha de contato — `_seg2/_contato.png`, que este script imprime. Não
    confiar na ordem em que o achador de manchas devolveu as caixas: ele acha
    por posição na página, e a posição não diz o que a figura é.

 Uso:  python3 _seg2/recortar_das_folhas.py
============================================================
"""
from __future__ import print_function

import io
import json
import os
import sys

try:
    from PIL import Image
except ImportError as e:                                   # pragma: no cover
    print(u"preciso de Pillow (%s)" % e)
    sys.exit(2)

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, os.path.join(RAIZ, u"_padrao"))
from recorte_folha import (limpa_fundo, tira_halo, aperta,          # noqa: E402
                           tira_linha_impressa)

FOLHAS = os.path.join(RAIZ, u"_sequencias", u"folhas_seg2")
DEST = os.path.join(AQUI, u"img")
PREFIXO = u"jq_"
MAIOR = 300

D02 = u"d02_09ba3c.jpg"
D19 = u"d19_bcec2c.jpg"

# nome, folha, x1, y1, x2, y2
PECAS = [
    # --- d02: os quatro bichos coloridos, um por frase da folha -------------
    # ⚠️ AS CAIXAS SAIRAM DE UMA MASCARA DE **COR**, e nao da mancha de tinta.
    #    Na primeira volta eu achei por tinta e as cinco vieram com um pedaco
    #    do COLCHETE da caixa de resposta grudado na direita — o `tira_linha_
    #    impressa` nao o alcanca, porque o canto de um colchete nao e um risco
    #    fino nem uma peca solta, e sim um L de 5 px. A figura tem cor, o
    #    colchete e preto: procurar por cor resolve sozinho.
    (u"tartaruga", D02,   82,  358,  208,  497),
    (u"joaninha",  D02,   60,  555,  215,  678),
    # ⚠️ A GALINHA e o TATU sao marrons e a mascara de cor os confundiu com a
    #    moldura da folha — as caixas deles saem A MAO, e na primeira volta as
    #    duas vieram CORTADAS: faltava a crista da galinha (o topo estava fora
    #    da caixa) e a CAUDA INTEIRA do tatu, que e comprida e passa de x=240.
    #    Foi o portao 1i7 que me fez olhar; olhando a folha ampliada com regua,
    #    os dois limites apareceram na hora. Conferir sempre na folha ampliada,
    #    nunca na caixa que o achador de manchas devolve.
    (u"galinha",   D02,   60,  703,  185,  872),
    (u"cachorro",  D02,   83, 1154,  187, 1320),
    (u"tatu",      D02,   60,  928,  250, 1062),

    # --- d19: as figuras do rebus (na folha elas ocupam o lugar de uma palavra)
    # ⚠️ OS NOMES AQUI ESTAVAM TODOS TROCADOS NA PRIMEIRA VOLTA, menos a casa.
    #    O achador de manchas devolve as caixas na ordem em que estao na PAGINA,
    #    e posicao nao diz o que a figura e. Estes nomes sao os que eu vi na
    #    folha de contato, olhando uma a uma.
    (u"casa",       D19,  908,  530, 1043,  666),
    (u"tijolos",    D19,  527,  810,  662,  934),
    (u"aranha",     D19,  140,  818,  288,  931),
    (u"cupim",      D19, 1393,  842, 1519,  968),
    (u"borboleta",  D19,   99, 1122,  263, 1277),
    (u"elefante",   D19,  910, 1462, 1060, 1606),
    (u"cachorrinho", D19, 630, 1514,  763, 1641),
]


DE_ONDE = {
    D02: u"d02 — SEGMENTE AS FRASES, OBSERVANDO OS ESPAÇOS ENTRE AS PALAVRAS",
    D19: u"d19 — SUBSTITUA AS IMAGENS PELAS PALAVRAS QUE AS NOMEIAM",
}


# ⚠️ O APAGADOR LOCAL — e por que ele existe, em vez de eu estreitar a caixa.
#    A folha d02 desenha uma CAIXA DE RESPOSTA ao lado de cada bicho, e o traço
#    dela passa DENTRO do retângulo que envolve o desenho: à direita da crista
#    da galinha, e por baixo das patas do tatu. Estreitar a caixa para fugir do
#    traço corta o bicho — foi exatamente o que aconteceu na primeira volta (a
#    galinha sem crista, o tatu sem cauda), e é a família de defeito que o
#    Marcos pegou em 19/set: *"esse tipo de erro não pode acontecer"*.
#    O `tira_linha_impressa` não os alcança: ele derruba risco de até 4 px, e
#    estes têm 8. Então o traço se apaga ONDE ELE ESTÁ, num retângulo declarado
#    e conferido na folha ampliada — nenhum pixel de desenho dentro dele.
#    Coordenadas RELATIVAS ao recorte.
APAGAR = {
    u"galinha": [(70, 0, 80, 58)],       # o traço vertical à direita da crista
    u"tatu":    [(132, 45, 190, 134)],   # o canto da caixa de resposta
}


def recorta(folha, x1, y1, x2, y2, nome=u""):
    c = folha.crop((x1, y1, x2, y2))
    if nome in APAGAR:
        from PIL import ImageDraw
        d = ImageDraw.Draw(c)
        for (a, b, e, f) in APAGAR[nome]:
            d.rectangle([a, b, e, f], fill=(255, 255, 255))
    c = limpa_fundo(c)
    c = tira_halo(c)
    c = aperta(c)
    if c is not None:
        c = aperta(tira_linha_impressa(c))
    return c


def main():
    if not os.path.isdir(FOLHAS):
        print(u"⛔ não achei %s" % FOLHAS)
        return 2
    abertas, feitas, origem = {}, [], {}
    cam = os.path.join(DEST, u"ORIGEM.json")
    if os.path.exists(cam):
        origem = json.load(io.open(cam, encoding=u"utf-8"))
    for nome, arq, x1, y1, x2, y2 in PECAS:
        if arq not in abertas:
            abertas[arq] = Image.open(os.path.join(FOLHAS, arq)).convert(u"RGB")
        c = recorta(abertas[arq], x1, y1, x2, y2, nome)
        if c is None:
            print(u"  ⚠️  %-10s saiu VAZIA" % nome)
            continue
        if max(c.size) > MAIOR:
            f = float(MAIOR) / max(c.size)
            c = c.resize((max(1, int(c.width * f)), max(1, int(c.height * f))),
                         Image.LANCZOS)
        alvo = PREFIXO + nome + u".png"
        c.save(os.path.join(DEST, alvo), optimize=True)
        origem[alvo] = u"folha:%s" % DE_ONDE[arq]
        feitas.append((alvo, c.size))
        print(u"  ✓ %-14s %3dx%-3d  <- %s" % (alvo, c.width, c.height, arq[:3]))
    io.open(cam, u"w", encoding=u"utf-8").write(
        json.dumps(origem, indent=1, sort_keys=True, ensure_ascii=False))
    print(u"\n%d figuras, todas recortadas de folha de papel." % len(feitas))
    folha_de_contato(feitas)
    return 0


def folha_de_contato(feitas):
    from PIL import ImageDraw
    COLS, CEL, LAB = 6, 180, 26
    linhas = (len(feitas) + COLS - 1) // COLS
    p = Image.new(u"RGB", (COLS * (CEL + 10) + 10, linhas * (CEL + LAB + 10) + 10),
                  (250, 250, 248))
    d = ImageDraw.Draw(p)
    for i, (alvo, _) in enumerate(feitas):
        im = Image.open(os.path.join(DEST, alvo)).convert(u"RGBA")
        im.thumbnail((CEL, CEL))
        x = 10 + (i % COLS) * (CEL + 10)
        y = 10 + (i // COLS) * (CEL + LAB + 10)
        d.rectangle([x, y, x + CEL, y + CEL], outline=(215, 215, 210))
        fundo = Image.new(u"RGBA", im.size, (255, 255, 255, 255))
        fundo.alpha_composite(im)
        p.paste(fundo.convert(u"RGB"), (x + (CEL - im.width) // 2,
                                        y + (CEL - im.height) // 2))
        d.text((x + 3, y + CEL + 6), alvo[len(PREFIXO):-4], fill=(40, 44, 52))
    cam = os.path.join(AQUI, u"_contato.png")
    p.save(cam, optimize=True)
    print(u"folha de contato: %s  — OLHAR antes de seguir" % cam)


if __name__ == u"__main__":
    sys.exit(main())
