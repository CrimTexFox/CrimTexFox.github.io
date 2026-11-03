export class ArtCard {
  constructor(data,index,onSelect){
    this.data=data;this.index=index;
    this.button=document.createElement('button');this.button.type='button';this.button.className='art-card';
    this.button.dataset.artIndex=index;this.button.setAttribute('aria-label',`Select artwork: ${data.alt}`);this.button.setAttribute('aria-pressed','false');
    this.button.style.background=data.paper||'#141015';
    const image=document.createElement('img');image.src=data.src;image.alt=data.alt;image.loading='lazy';image.decoding='async';this.button.append(image);
    this.button.addEventListener('focus',()=>onSelect(index));
    this.button.addEventListener('click',()=>onSelect(index));
  }
}
export class ArtStack {
  constructor(container,data){
    this.container=container;this.active=-1;this.pointerX=null;this.pointerY=null;
    this.cards=data.map((entry,index)=>new ArtCard(entry,index,selected=>this.select(selected)));
    this.cards.forEach(card=>container.append(card.button));
    container.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch'||event.clientX===this.pointerX&&event.clientY===this.pointerY)return;
      this.pointerX=event.clientX;this.pointerY=event.clientY;
      const card=event.target.closest('.art-card'),focused=container.querySelector('.art-card:focus-visible');
      this.select(card?Number(card.dataset.artIndex):focused?Number(focused.dataset.artIndex):-1);
    });
    container.addEventListener('pointerleave',event=>{
      if(event.pointerType==='touch')return;
      this.pointerX=null;this.pointerY=null;
      const focused=container.querySelector('.art-card:focus-visible');this.select(focused?Number(focused.dataset.artIndex):-1);
    });
    container.addEventListener('focusout',event=>{if(!container.contains(event.relatedTarget))this.select(-1);});
    container.addEventListener('keydown',event=>{
      const current=Number(event.target.dataset.artIndex);if(!Number.isInteger(current))return;
      let next;
      if(event.key==='ArrowRight'||event.key==='ArrowDown')next=Math.min(this.cards.length-1,current+1);
      else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=Math.max(0,current-1);
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=this.cards.length-1;
      else if(event.key==='Escape'){event.preventDefault();event.target.blur();this.select(-1);return;}
      else return;
      event.preventDefault();this.cards[next].button.focus({preventScroll:true});
    });
    document.addEventListener('pointerdown',event=>{if(!container.contains(event.target))this.select(-1);});
    new ResizeObserver(()=>this.layout()).observe(container);this.layout();
  }
  layout(){
    const count=this.cards.length,width=this.container.clientWidth;if(!count||!width)return;
    const extent=1+(count-1)*.2;
    this.cardWidth=Math.min(480,(width-24)/(extent+.12));this.cardHeight=this.cardWidth*.75;
    const left=(width-this.cardWidth*extent)/2;
    this.container.style.height=`${this.cardHeight*extent+64}px`;
    this.cards.forEach((card,index)=>{
      Object.assign(card.button.style,{left:`${left+index*this.cardWidth*.2}px`,top:`${28+index*this.cardHeight*.2}px`,width:`${this.cardWidth}px`,height:`${this.cardHeight}px`,zIndex:String(count-index)});
    });this.render();
  }
  select(index){if(this.active===index)return;this.active=index;this.render();}
  render(){
    this.cards.forEach((card,index)=>{
      const selected=index===this.active,above=this.active>=0&&index<this.active;
      const offset=above?((this.active-index)*.2-1.04-(this.active-index-1)*.12)*this.cardWidth:0;
      card.button.style.transform=`translate(${offset}px,${selected?-this.cardHeight*.02:0}px) scale(${selected?1.06:1})`;
      card.button.classList.toggle('is-selected',selected);card.button.setAttribute('aria-pressed',String(selected));
    });
  }
}
