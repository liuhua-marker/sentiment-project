export function showButton(path, code) {
    let buttonArr = JSON.parse(sessionStorage.getItem(path))
    let flag = buttonArr.some(item => {
        if (item.menuCode == code) {
            return true;
        }
    });

    return flag
}