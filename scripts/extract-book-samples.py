from pathlib import Path
import fitz,json
out=Path('public/samples');out.mkdir(exist_ok=True)
items=[]
for slug,folder,pages,title,chapter in [('dont-do-anything','book',range(28,34),"Don’t Do Anything",'Finding Your Winning Topic'),('sell-without-an-audience','Sell Without an Audience',range(4,7),'Sell Without an Audience','Where Your Buyers Already Are')]:
 source=next((Path('book-exports/Single Books')/folder).glob('*.pdf'));doc=fitz.open(source);texts=[]
 for i in pages:
  page=doc[i]; page.get_pixmap(matrix=fitz.Matrix(1.35,1.35)).save(str(out/f'{slug}-{i+1}.png'));texts.append({'number':i+1,'image':f'/samples/{slug}-{i+1}.png','text':page.get_text()})
 items.append({'slug':slug,'title':title,'chapter':chapter,'totalPages':len(doc),'pages':texts})
Path('src/data/book-samples.json').write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf-8')
