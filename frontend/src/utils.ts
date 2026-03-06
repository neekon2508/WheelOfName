export const getBoyMap = () => {
    const names = [
'hoàng gầy',
'phúc',
'lam',
'hoàng lead',
'bách',
'toàn',
'quý',
'hiếu' ,
'sáng',
'tuấn',
'đạt',
'đức anh',
'hiệp' ,
'quang',
'tài',
'tùng',
'quân',
'văn huy',
'trí',
'chiến' ,
'long',
'sinh huy',
'Khánh',
'thế anh',
'nghĩa',
]
    const boyMap = new Map();
    for (let i =1; i<= names.length; i++)
        boyMap.set(i, names[i-1]);
    return boyMap;

}