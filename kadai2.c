//2023音情報処理の第3回サンプルプログラムです．
//デフォルトでは，440Hzの純音がoutput.wavとして生成され，プログラムから再生されます．
//同時に，そのもととなる波の数値データがoutput.csvとして出力されます．これは，excelなどでグラフ化できます．

#include<stdio.h>
#include<windows.h> //mciSendStringはwindowsのAPIなので，このヘッダファイルが必要．
#include<math.h>
#define PI 3.141592

void WaveCreation(long data_number) { //サンプリング周波数44100Hzで，2秒間の波を作る関数
	int i = 0;
	double ph, ph2, Amplifier=7000.0, Amplifier2=4000.0;
	FILE *fp;

	if (fopen_s(&fp, "output1.csv", "w")) // 書き込むファイルの指定
		printf("output error");

	for (i = 0; i < data_number; i++) {
		//data_numberはサンプル数88200が入っている．課題の提出では，（基本的には）変更しないこと．
		//純音の波と複合波を生成するための命令を用意した．１と２を同時に使うことはできない，注意すること．

		//１．純音の波を作りたい場合．
		//ph = 2.0 * PI * 440.0 * i / 44100.0;
		//fprintf_s(fp, "%d\n", (int)(Amplifier * sin(ph)));

		//２．複合波を作りたい場合．
		int Ph = 0;
		for (double n = 1.0; n < 50; n++) {
			ph = 2.0 * PI * 440.0 * n * i / 44100.0;
			Ph +=sin(ph)* (Amplifier/n);
		}
		fprintf_s(fp, "%d\n", (int)(Ph));
		
		//ph = 2.0 * PI * 440.0 * i / 44100.0;
		//ph2 = 2.0 * PI * -440.0 * i / 44100.0;
		//fprintf_s(fp, "%d\n", (int)(Amplifier*sin(ph) + Amplifier*sin(ph2)));
	}

	fclose(fp);
}


void main()
{
	//チャネル数，サンプリング周波数，量子化ビット数，全サンプル数は，Wavファイルを書き出す上で必須．
	int             data, i, ch = 1, sr = 44100, bit = 16;
	long riff_cnksize, data_cnksize, data_number = 44100*2;
	char            s[16];
	FILE           *fp0, *fp1;

	WaveCreation(data_number); //波形生成関数の呼び出し．

	if (fopen_s(&fp0, "output1.csv", "r")) //読み込むファイルの指定
		printf("\aInput file2 is not found!");
	if (fopen_s(&fp1, "output1.wav", "wb")) // 書き込むファイルの指定
		printf("output error2");

	printf("%d, %d, %d, %ld", ch, sr, bit, data_number);
	data_cnksize = data_number * (bit / 8);
	riff_cnksize = data_cnksize + 36;

	sprintf_s(s, 16, "RIFF");
	fwrite(s, 1, 4, fp1);
	fwrite(&riff_cnksize, 4, 1, fp1);
	sprintf_s(s, 16, "WAVEfmt ");
	fwrite(s, 1, 8, fp1);
	i = 16;
	fwrite(&i, 4, 1, fp1);
	i = 1;
	fwrite(&i, 2, 1, fp1);
	fwrite(&ch, 2, 1, fp1);
	fwrite(&sr, 4, 1, fp1);
	i = (bit / 8) * ch * sr;
	fwrite(&i, 4, 1, fp1);
	i = (bit / 8) * ch;
	fwrite(&i, 2, 1, fp1);
	fwrite(&bit, 2, 1, fp1);
	sprintf_s(s, 16, "data");
	fwrite(s, 1, 4, fp1);
	fwrite(&data_cnksize, 4, 1, fp1);

	i = 0;
	while (fscanf_s(fp0, "%d", &data) != EOF) { //波形データの読み込み
		i++;
		fwrite(&data, bit / 8, 1, fp1); //読み込んだ波形データの書き込み
		if (ch == 2) { //ステレオ形式の場合の処理．この講義の課題では使用しない．
			i++;
			fscanf_s(fp0, "%d", &data);
			fwrite(&data, bit / 8, 1, fp1);
		}
	}
	fclose(fp0);
	fclose(fp1);

	mciSendString("open output1.wav alias wave", NULL, 0, 0);
	mciSendString("play wave", NULL, 0, 0); //Wavファイルの再生．
	getchar(); //Enterキーが押されるまで大気．空の文字入力や時間経過条件などを入れないと，再生がすぐに終わってしまうので注意．
	mciSendString("close wave", NULL, 0, 0);

	exit(0);
}