/* FIX: getline() 与 POSIX <stdio.h> 的 getline() 冲突（Linux/macOS 下编译报错），已重命名为 get_line()；另在读取循环中补 EOF 判断，避免 EOF 时死循环。 */
#define MAXLINE 1000 /* maximum input line length */
#include<stdio.h>
int get_line(char line[], int max);
int strindex(char source[], char searchfor[]);
char pattern[] = "ree"; 

main()
{
    char line[MAXLINE];
    int found = 0;
    while (get_line(line, MAXLINE) > 0)
        if (strindex(line, pattern) >= 0) 
    	{
            printf("%s", line);
            found++;
    	}
        return found;
}
/* get_line: get line into s, return length */
int get_line(char s[], int lim)
{
    int c, i;
    i = 0;
    while (--lim > 0 && (c=getchar()) != EOF && c != '*' && c != '\n')
        s[i++] = c;
    if (c == '\n')
        s[i++] = c;
    s[i] = '\0';
    return i;
}
/* strindex: return index of t in s, -1 if none */
int strindex(char s[], char t[])
{
    int i, j, k;
    for (i = 0; s[i] != '\0'; i++)
    {
        for (j=i, k=0; t[k]!='\0' && s[j]==t[k]; j++, k++);
        	if (k > 0 && t[k] == '\0')
            	return i;
    }
    return -1;
}
