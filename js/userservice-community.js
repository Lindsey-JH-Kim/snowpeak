//화살표위방향 클릭하면 scroll top되기
$('.up').click(function(){
  console.log('click click click')
  $(window).scrollTop(0)
})

//more버튼 누르면 article의 갯수가 6의배수보다 클때마다 section height를 880px씩 추가하기
var count = 1
var numAtc = $('article').length
if(numAtc <= 6){
  $('#morebutton').css('visibility','hidden')
}

$('#morebutton').click(function(){
  console.log('button 클릭')
  console.log(numAtc)
    if(numAtc > 6*count){
      count++
      $('section').css('height',`calc(880px * ${count})`)
    } 
    if(numAtc <= 6*count){
      $('#morebutton').css('visibility','hidden')
      }
})