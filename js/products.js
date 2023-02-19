//화살표위방향 클릭하면 scroll top되기
$('.up').click(function(){
  console.log('click click click')
  $(window).scrollTop(0)
})

//카테고리 클릭하면 글색상 변하기
$('h3').click(function(e){
  $('.cgr').removeClass('addColor');
  $(e.target).addClass('addColor')
})
//more버튼 누르면 article의 갯수가 9의배수보다 클때마다 section height를 1400px씩 추가하기
var count = 1
var numAtc = $('article').length
if(numAtc <= 9){
  $('.contentB button').css('visibility','hidden')
}

$('.contentB button').click(function(){
    if(numAtc > 9*count){
      count++
      $('section').css('height',`calc(1400px * ${count})`)
    } 
    if(numAtc <= 9*count){
      $('.contentB button').css('visibility','hidden')
      }
})

//검색기능 만들기 URL Query String
$('#search').click(function(){
  console.log('aa')
  var searchInputVal = $('#search-input').val();
  window.location.replace('/search?value='+ searchInputVal) 
})
