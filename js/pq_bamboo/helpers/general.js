export default { 
    repeatString(txt, num)
    {
        let str = "";
        for(let i = 0; i < num; i++)
        {
            str += txt;
        }
        return str;
    },

    divideString(s1, s2)
    {
        for(let i = 0; i < s2.length; i++)
        {
            s1 = s1.replaceAll(s2[i], "");
        }
        return s1;
    }
}