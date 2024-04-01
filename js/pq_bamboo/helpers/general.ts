export default 
{ 
    repeatString(txt:string, num:number)
    {
        let str = "";
        for(let i = 0; i < num; i++)
        {
            str += txt;
        }
        return str;
    },

    divideString(s1:string, s2:string)
    {
        for(let i = 0; i < s2.length; i++)
        {
            s1 = s1.replaceAll(s2[i], "");
        }
        return s1;
    }
}