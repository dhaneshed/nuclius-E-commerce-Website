
const userHelpers=require('../helpers/userHelpers');



module.exports={
  userAuth:(req,res,next)=>{
    if(req.session.user){
      next()
    }
    else{
      res.redirect('/login')
    }
       
  },
    adminAuth:(req,res,next)=>{
      if(req.session.adminloggedIn){
        next()
      }else{
        res.redirect('/admin/login')
      }
    },
    blockedStatus:async(req,res,next)=>{
      let userId=req.session.user._id
      let blockeduser= await userHelpers.blockedUserCheck(userId)
      if(blockeduser.isBlocked===false){
      next()
      }else{
        res.redirect('/logout')
      }
    }
  
}
