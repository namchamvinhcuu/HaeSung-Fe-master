import * as ConfigConstants from "@constants/ConfigConstants";
class UserManager {
  // constructor(name) {
  //     this.CurrentUser=JSON.parse(localStorage.getItem(ConfigConstants.CURRENT_USER));
  // }
  getcurrentuser() {
    return JSON.parse(localStorage.getItem(ConfigConstants.CURRENT_USER));
  }

  get User() {
    return this.getcurrentuser();
  }

  get UserId() {
    return this.getcurrentuser()?.userId;
  }

  get UserName() {
    return this.getcurrentuser()?.userName;
  }

  // get Noticafitions() {
  //     var user=this.getcurrentuser();

  //     return {notifies:user?.user_info.notifies, total:user?.user_info.total_Notification}
  // }

  // UpdateNocations(notifies,total){
  //         var user=this.getcurrentuser();
  //         if (user) {
  //             user.user_info.total_Notification=total;
  //             user.user_info.notifies=notifies;
  //             localStorage.setItem(ConfigConstants.CURRENT_USER,JSON.stringify(user) )
  //         }

  // }

  print() {
    // console.log(this.getcurrentuser(), 'UserManager');
  }
}

export default new UserManager();
