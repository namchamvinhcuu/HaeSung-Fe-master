
//attacj vào header của mỗi request với token uỷ quyền

import * as ConfigConstants from '@constants/ConfigConstants';

export const AuthHeader = () => {
    // return authorization header with jwt token
  //  let user = JSON.parse(localStorage.getItem(ConfigConstants.CURRENT_USER));

  
  let access_token=  localStorage.getItem(ConfigConstants.TOKEN_ACCESS);
    let refresh_token= localStorage.getItem(ConfigConstants.TOKEN_REFRESH);
    let lang_code= localStorage.getItem(ConfigConstants.LANG_CODE); 


    if (access_token ) {
        return { 
            'Authorization': 'Bearer ' + access_token,
             'X-Authorization': 'Bearer ' + refresh_token,
             'Accept-Language':lang_code
     };
    } else {
        return {};
    }
};