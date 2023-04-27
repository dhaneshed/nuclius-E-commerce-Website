function addToCart(proId) {
  $.ajax({
    url: '/addToCart/' + proId,
    method: 'get',
    success: (response) => {

      if (response.outOfStock) {
        
        Swal.fire({
          icon: 'warning',
          title: 'Out of Stock',
        }).then(() => {
          location.reload();
        });

      } else {
        let count = $('#cartCount').html()
        count = parseInt(count) + 1

        $("#cartCount").html(count)
        Swal.fire({
          icon: 'success',
          title: 'Added to Cart',
        })
      } 

    }
  })
}

function addToWishList(proId) {
  $.ajax({
    url: '/addToWishList/' + proId,
    method: 'get',
    success: (response) => {

      if (response.status) {
        let count = $('#wishListCount').html()
        count = parseInt(count) + 1

        $("#wishListCount").html(count)
        Swal.fire({
          icon: 'success',
          title: 'Added to Wish List',
        })
      } else {

        Swal.fire({
          icon: 'warning',
          title: 'Out of Stock',
        }).then(() => {
          location.reload();
        });


      }

    }
  })
}


function namecheck() {
  let name = document.getElementById("name").value
  let nm = null
  nm = name.trim()
  var letters = /^[A-Za-z]+$/;
  var spc = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+[A-Za-z]*$/;
  document.getElementById("name").value = nm;
  if (nm == "" || name == null) {
    document.getElementById("nmlabel").style.display = "block"
    return false
  }
  else if (!isNaN(nm[0])) {
    document.getElementById("nmlabel").style.display = "none"
    document.getElementById("nmlabel-01").style.display = "block"
    return false
  }
  else if (nm.match(spc)) {
    document.getElementById("nmlabel").style.display = "none"
    document.getElementById("nmlabel-01").style.display = "none"
    document.getElementById("nmlabel-02").style.display = "block"
    return false
  }
  else {
    document.getElementById("nmlabel").style.display = "none"
    document.getElementById("nmlabel-01").style.display = "none"
    document.getElementById("nmlabel-02").style.display = "none"
    return true

  }
}
function phonecheck() {

  var val = document.getElementById("phone").value
  var v = null
  v = val.trim()
  document.getElementById("phone").value = v;
  var n = v.length
  console.log(n)
  if (v == "" || val == null) {
    document.getElementById("ml").style.display = "block"
    return false
  }
  else if (10 > n) {
    console.log(v.length)
    document.getElementById("ml-01").style.display = "block"
    return false
  }
  else {
    document.getElementById("ml").style.display = "none"
    document.getElementById("ml-01").style.display = "none"
    return true
  }
}


function emailcheck() {
  var val = document.getElementById("email").value
  var v = null
  v = val.trim()
  document.getElementById("email").value = v;
  if (v == "" || val == null) {
    document.getElementById("el").style.display = "block"
    return false
  }
  else if (!isNaN(v[0])) {
    document.getElementById("el-01").style.display = "block"
    return false
  }


  else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v)) {
    document.getElementById("el-02").style.display = "block"
    return false
  }
}

function passwordcheck() {
  let password = document.getElementById("password").value.trim();
  let hasNumber = /\d/.test(password);
  let hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (password.length < 6) {
    document.getElementById("pwlabel").style.display = "none";
    document.getElementById("pwlabel-01").style.display = "none";
    document.getElementById("pwlabel-02").style.display = "none";
    document.getElementById("pwlabel-03").style.display = "block";
    return false;
  }

  if (!hasNumber) {
    document.getElementById("pwlabel").style.display = "none";
    document.getElementById("pwlabel-01").style.display = "block";
    document.getElementById("pwlabel-02").style.display = "none";
    document.getElementById("pwlabel-03").style.display = "none";
    return false;
  }

  if (!hasSpecialChar) {
    document.getElementById("pwlabel").style.display = "none";
    document.getElementById("pwlabel-01").style.display = "none";
    document.getElementById("pwlabel-02").style.display = "block";
    document.getElementById("pwlabel-03").style.display = "none";
    return false;
  }

  // Password meets all criteria
  document.getElementById("pwlabel").style.display = "none";
  document.getElementById("pwlabel-01").style.display = "none";
  document.getElementById("pwlabel-02").style.display = "none";
  document.getElementById("pwlabel-03").style.display = "none";
  return true;
}


