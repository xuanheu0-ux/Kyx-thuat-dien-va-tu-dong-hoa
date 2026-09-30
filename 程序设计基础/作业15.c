#include<stdio.h>
int main()
{
	int a,t,sum=1;
	scanf("%d",&a);
	t=a;
	while(a>0)
	{
		sum=sum*a;
		a=a-1;
	}
	printf("%d的阶乘是%d。",t,sum); 
	return 0;
}
