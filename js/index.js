//화살표위방향 클릭하면 scroll top되기
$('.up').click(function(){
  console.log('click click click')
  $(window).scrollTop(0)
})


//메인이미지 무한루프
//버튼클릭하면 그룹이 x선따라 움직이는 형태로 구현
var viewImg = 0
function view0(){
  $('.imgGroup').css('transform','translateX(0vw)')
  $('.titleGroup').css('transform','translateX(0%)')
  $('.pGroup').css('transform','translateX(0%)')
  $('.btnGroup').css('transform','translateX(0%)')
  
}
function view1(){
  $('.imgGroup').css('transform','translateX(-100vw)');
  $('.titleGroup').css('transform','translatex(-33.3%)');
  $('.pGroup').css('transform','translatex(-33.3%)');
  $('.btnGroup').css('transform','translatex(-33.3%)');
}
function view2(){
  $('.imgGroup').css('transform','translateX(-200vw)')
  $('.titleGroup').css('transform','translatex(-66.6%)')
  $('.pGroup').css('transform','translatex(-66.6%)')
  $('.btnGroup').css('transform','translatex(-66.6%)')
}

//메인이미지 오른쪽화살표 클릭시 그 다음사진 나오기
$('.chevronRgt').click(function(){
  console.log(viewImg)
  if(viewImg == 0){
    viewImg ++
    view1()
  } else if(viewImg == 1){
    viewImg ++
    view2()
  }
})

//메인이미지 왼쪽화살표 클릭시 그 전에 사진 나오기
$('.chevronLft').click(function(){
  console.log(viewImg)
  if(viewImg == 2){
    viewImg -= 1
    view1()
  } else if(viewImg == 1){
    viewImg -=1 
    view0() 
  }
})

//메인이미지 동그라미버튼 클릭 시마다 각각사진 나오기
$('.c1').click(function(){
  viewImg = 0;
  view0()
})

$('.c2').click(function(){
  viewImg = 1;
  view1()
})

$('.c3').click(function(){
  viewImg = 2;
  view2()
})

//무한루프 메인이미지 1번 2번 3번 1번 2번 3번 3초간격으로 계속 나오기
var interval = setInterval(function timer(){
  if(viewImg == 0){
    viewImg ++
    view1()
  } else if(viewImg == 1){
    viewImg ++
    view2()
  } else if(viewImg == 2){
    viewImg -= 2
    view0()
  }
},3000)

//정지버튼 플레이버튼 누를때마다 무한루프 메인이미지 멈추고 플레이되기
var count = 0
$('.pause').click(function(){
  count ++
  if(count % 2 == 1){
    $('.pause').html('<i class="fa-solid fa-circle-play"></i>')
    clearInterval(interval)
  } else{
    $('.pause').html('<i class="fa-solid fa-circle-pause"></i>')
    interval = setInterval(function timer(){
      if(viewImg == 0){
        viewImg ++
        view1()
      } else if(viewImg == 1){
        viewImg ++
        view2()
      } else if(viewImg == 2){
        viewImg -= 2
        view0()
      }
    },3000)
  }
})

//content2 오른쪽 이미지와 화살표 클릭시 왼쪽이미지 바꾸기
function img1(){
  $('.imgGroupLft').css('transform','translateX(0%)')
  $('.imgGroupRgt .i1').addClass('borderShow')
  $('.imgGroupRgt .i2').removeClass('borderShow')
  $('.imgGroupRgt .i3').removeClass('borderShow')
}
function img2(){
  $('.imgGroupLft').css('transform','translateX(-33.3%)')
  $('.imgGroupRgt .i2').addClass('borderShow')
  $('.imgGroupRgt .i1').removeClass('borderShow')
  $('.imgGroupRgt .i3').removeClass('borderShow')
}
function img3(){
  $('.imgGroupLft').css('transform','translateX(-66.6%)')
  $('.imgGroupRgt .i3').addClass('borderShow')
  $('.imgGroupRgt .i1').removeClass('borderShow')
  $('.imgGroupRgt .i2').removeClass('borderShow')
}
//오른쪽화살표 클릭시 오른쪽이미지순서대로 바뀌면서 오른쪽 이미지 바뀌기

var arrCount = 0
$('.content2 .chevronRgt').click(function(){
  if(arrCount == 0){
    img1()
    arrCount ++
  } else if(arrCount == 1){
    img2()
    arrCount ++
  } else if (arrCount == 2){
    img3()
    arrCount -=2
  }
});

//오른쪽이미지1 클릭시 우측이미지 나오기
$('.imgGroupRgt .i1').click(function(){
  img1()
  arrCount = 0
})

//오른쪽이미지2 클릭시 우측이미지 나오기
$('.imgGroupRgt .i2').click(function(){
  img2()
  arrCount = 1
})

//오른쪽이미지3 클릭시 우측이미지 나오기
$('.imgGroupRgt .i3').click(function(){
  img3()
  arrCount = 2
})
   


//content3 moreproducts버튼 누르면 숨겨져있던 section 나오고 close버튼생성
//close버튼 누르면 원상복구
var morecount = 0
$('.content3 button').click(function(){
  morecount ++
  if(morecount % 2 ==1){
    console.log(morecount)
    $('.sectionView').removeClass('overflow')
    $('.content3 button').html('close')
  } else if(morecount % 2 == 0){
    $('.sectionView').addClass('overflow')
    $('.content3 button').html('More Products')
    // morecount = 0
  }
})


//content4 아티클이 화살표 방향대로 움직이기
//클릭하면 아티클이 앞뒤로 움직이는 형태로 구현

$('.content4 .chevronRgt').click(function(){
  $('.content4 .atcGroup').find('article:first').appendTo('.atcGroup');  
})

$('.content4 .chevronLft').click(function(){
  $('.content4 .atcGroup').find('article:last').prependTo('.atcGroup');
})