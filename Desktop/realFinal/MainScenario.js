const textElement = document.getElementById('typewriter');
const text = textElement.innerText;
textElement.innerText = ''; // 초기화
let i = 0;
        
function typeWriter() {
    if (i < text.length) {
        textElement.innerText += text.charAt(i);
        i++;
        setTimeout(typeWriter, 50); // 다음 글자 출력까지 50ms 대기
    }
}
        
typeWriter(); // 함수 실행
