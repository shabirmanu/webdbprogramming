function onSubmitForm(event) {
  event.preventDefault(); // 기본 제출 동작 방지

  // 폼 데이터 가져오기
  // const formData = new FormData(event.target);
  const jsonString = {};
  new FormData(event.target).forEach((value, key) => {
    jsonString[key] = value;
  });

  console.log(jsonString)

  // Fetch API를 사용하여 POST 요청 보내기
  fetch('/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jsonString),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('제출 중 오류가 발생했습니다.');
    }
    return response.json();
  })
  .then(_ => {
    alert('제출되었습니다.')
    location.href = location.href
  })
  .catch(error => {
    alert('제출 중 오류가 발생했습니다.')
    console.error('response is not success, ', error)
  });
}

function onClickEdit(id, password) {
  console.log('onClickEdit: ' + id + ', ' + password)

  if (confirm('수정하시겠습니까?')) {
    const inputPassword = prompt('비밀번호를 입력해주세요.')
    if (inputPassword === password) {
        const data = {
          id,
          message: prompt('수정할 내용을 입력해주세요.'),
        };

        fetch('/contact', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            alert('수정이 완료되었습니다!');
            location.href = location.href;
          } else {
            alert('수정 중 오류가 발생했습니다.');
          }
        })
        .catch((error) => {
          alert('오류가 발생했습니다.');
        });
    } else {
      alert('비밀번호가 틀렸습니다.')
    }
  } else {
    /* no-op */
  }
}

function onClickDelete(id, password) {
  console.log('onClickDelete: ' + id + ', ' + password)

  if (confirm('삭제하시겠습니까?')) {
    const inputPassword = prompt('비밀번호를 입력해주세요.')
    if (inputPassword === password) {
        const data = {
          id
        };

        fetch('/contact', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            alert('삭제가 완료되었습니다!');
            location.href = location.href;
            // 선택적으로 데이터를 다시로드하거나 UI를 업데이트할 수 있습니다.
          } else {
            alert('삭제 중 오류가 발생했습니다.');
          }
        })
        .catch((error) => {
          alert('오류가 발생했습니다.');
        });
    } else {
      alert('비밀번호가 틀렸습니다.')
    }
  } else {
    /* no-op */
  }
}