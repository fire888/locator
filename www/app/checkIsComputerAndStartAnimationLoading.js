
/***********************************************; 
 *  Project        : Machine
 *  Program name   : Start script
 *  Author         : www.otrisovano.ru
 *  Date           : 14.05.2018 
 *  Purpose        : check brain   
 ***********************************************/

( function( window ) { 
  'use strict'

  const StartLoader = window.startLoader || {};

  window.StartLoader = StartLoader;
  StartLoader.isMobile = false;     

  function setStopMobileMess() {

    let loaderBar = document.getElementById( 'loadBar' );
    loaderBar.style.display = 'none'; 
    let loadMess = document.getElementById( 'loadMess' );
    loadMess.innerHTML =   "<i>Sorry...<br/>" + 
      "<br/>Game need keyboard. Come in from computer or laptop.</i>";
    StartLoader.isMobile = true;    
  }

  function startLoadAnimation () {

    let loadAnimate = document.getElementById( 'loadAnimate' );
    let imgMargin = -1300;
    let animation = () => {
      imgMargin +=1;
      loadAnimate.style.marginLeft = imgMargin + 'px';
      if ( imgMargin > -30 ) { imgMargin = -1300; }
    } 
    StartLoader.loaderInterval = setInterval( animation, 30 );
  }

  if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent ) ) {
    setStopMobileMess();
  } else {
    startLoadAnimation();
  }

} )( window );



