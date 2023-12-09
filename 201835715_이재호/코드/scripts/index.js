function onClickSignIn(event) {
    const id = document.getElementById('id').value;
    const password = document.getElementById('password').value;

    // 폼 데이터 가져오기
    // const formData = new FormData(event.target);
    const jsonString = {};
    jsonString['id'] = id;
    jsonString['password'] = password;
  
    console.log(jsonString)
  
    // Fetch API를 사용하여 POST 요청 보내기
    fetch('/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonString)
    })
    .then(response => {
      if (response.status !== 200) {
        if (response.status === 404) {
          throw new Error('존재하지 않는 회원 정보입니다.')        
        } else {
          throw new Error('[' + response.status + ']: ' + response.statusText);
        }
      }
      return response.json();
    })
    .then(response => {
      alert('로그인되셨습니다. 환영합니다, ' + response.userName + ' 님.')
      
      location.href = location.href
    })
    .catch(error => {
      alert('로그인 중 오류가 발생했습니다: ' + error)
      console.error('response is not success, ', error)
    });
}

function onClickSignUp() {
    const id = document.getElementById('id').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    
    if (name === '') {
        alert('이름을 입력해주세요')
    } else {
        const jsonString = {};
        jsonString['id'] = id;
        jsonString['password'] = password;
        jsonString['name'] = name;
      
        console.log(jsonString['id'] + ', ' + jsonString['password'] + ', ' + jsonString['name'])
      
        // Fetch API를 사용하여 POST 요청 보내기
        fetch('/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonString)
        })
        .then(response => {
          if (response.status !== 200) {
            if (response.status === 409) {
              throw new Error('이미 존재하는 아이디입니다.')
            } else {
              throw new Error('[' + response.status + ']: ' + response.statusText);
            }
          }
          return response.json();
        })
        .then(_ => {
          alert('회원가입이 완료되었습니다.')
          location.href = location.href
        })
        .catch(error => {
          alert('회원가입 중 오류가 발생했습니다: ' + error)
          console.error('response is not success, ', error)
        });
    }
}

function onClickLogOut() {
  fetch('/logout', {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    if (response.status !== 200) {
      throw new Error('[' + response.status + ']: ' + response.statusText);
    }
    return response.json();
  })
  .then(_ => {
    alert('로그아웃이 완료되었습니다. 안녕히 가세요.')
    location.href = location.href
  })
  .catch(error => {
    alert('로그아웃 중 오류가 발생했습니다: ' + error)
    console.error('response is not success, ', error)
  });
}