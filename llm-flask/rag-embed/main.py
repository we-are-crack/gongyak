import embed_by_candidate.kimmoonsoo.embed as kms
import embed_by_candidate.leejaemyung.embed as ljm
import embed_by_candidate.leejunseok.embed as ljs
from embedder.text_embedder import TextEmbedder

text_embedder = TextEmbedder()

kms.embed(text_embedder)
ljm.embed(text_embedder)
ljs.embed(text_embedder)
