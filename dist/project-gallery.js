const element=(tag,className)=>{const node=document.createElement(tag);if(className)node.className=className;return node;};
let viewer;
function mediaViewer(){
  if(viewer)return viewer;
  const dialog=element('dialog','media-dialog'),close=element('button','close-button'),content=element('div','media-viewer-content');
  close.type='button';close.textContent='×';close.setAttribute('aria-label','Close media');
  dialog.append(close,content);document.body.append(dialog);
  let trigger;
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  });
  dialog.addEventListener('close',()=>{content.querySelectorAll('video').forEach(video=>video.pause());content.replaceChildren();trigger?.focus({preventScroll:true});});
  viewer={
    open(media,button){
      trigger=button;content.replaceChildren();dialog.setAttribute('aria-label',media.alt||'Project media');
      const item=element(media.type==='video'?'video':'img');item.src=media.src;
      if(media.type==='video'){item.controls=true;item.playsInline=true;item.autoplay=true;item.preload='metadata';if(media.poster)item.poster=media.poster;}
      else item.alt=media.alt||'';
      content.append(item);dialog.showModal();
    },
    close(){if(dialog.open)dialog.close();}
  };
  return viewer;
}
export class ProjectGallery {
  constructor(project){
    this.element=element('div','project-gallery project-gallery-grid');this.element.setAttribute('aria-label',`${project.title} media gallery`);
    for(const media of project.media||[]){
      const button=element('button','media-tile');button.type='button';
      button.setAttribute('aria-label',`${media.type==='video'?'Play':'View'} ${media.alt||project.title}`);
      const thumbnail=element('img');thumbnail.src=media.type==='video'?media.poster:media.src;thumbnail.alt=media.alt||'';thumbnail.loading='lazy';thumbnail.decoding='async';button.append(thumbnail);
      if(media.type==='video'){const play=element('span','media-play');play.textContent='▶';play.setAttribute('aria-hidden','true');button.append(play);}
      button.addEventListener('click',()=>mediaViewer().open(media,button));this.element.append(button);
    }
  }
  static closeViewer(){viewer?.close();}
}
