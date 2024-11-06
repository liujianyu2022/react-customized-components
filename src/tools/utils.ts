/**
 *
 * @param {*} key
 */

export function sortBy(key: string) {
    return (a: any, b: any) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
}

// 中文 字母 数字  （） ()   -  _   /  \  :  ：
export function inputReg(str: string): boolean {
    let reg = /^[\u4E00-\u9FA5\w\(\:\\\/\-\（\）\：]+$/
    return reg.test(str)
}

// 数字 小数
export function numberReg(str: string): boolean {
    let reg = /^(\+|\-)?\d+(\.\d+)?$/
    return reg.test(str)
}

// 中文 数字 _
export function editTableReg1(str: string): boolean {
    let reg = /^[\u4E00-\u9FA5\w]*$/
    return reg.test(str)
}

export function getSearchParams() {
    let searchStr = location.search.replace("?", "");
    let searchObject: any = {
        pathname: location.pathname,
    };
    if (searchStr) {
        let searchArr = searchStr.split("&");
        searchArr.forEach((item) => {
            let arr = item.split("=");
            searchObject[arr[0]] = decodeURIComponent(arr[1]);
        });
    }
    return searchObject;
}

const AUTH_TOKEN_NAME = 'app-token';
export function setAuthToken(val: string | null) {
    window.localStorage.setItem(AUTH_TOKEN_NAME, val || '');
}
export function getAuthToken() {
    return window.localStorage.getItem(AUTH_TOKEN_NAME) || '';
}
export function clearAuthToken() {
    window.localStorage.removeItem(AUTH_TOKEN_NAME);
}