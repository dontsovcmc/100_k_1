
#include <QtGui>

#include <QDialog>
#include <QAbstractItemModel> 
#include <QFileDialog>
#include <QMessageBox>
#include <QImage>
#include <QPixmap>
#include <QKeyEvent>
#include "math.h"
#include "window.h"
#include <QLCDNumber>
#include <QTimer>
#include <QSound>
#include <QTextCodec>

#define WIN_POINT 80

#define TIMER1 15
#define TIMER2 20
#define TIMER3 60

#define COMPANYTITLE "DonSoft"
#define APPTITLE "StoOne"

#define SETT_FILE_PATH "base.ini"

Window::Window()
{

  help_show = FALSE;

  LoadSettings(SETT_FILE_PATH);
      
  pal3 = new QPalette;
  pal3->setColor(QPalette::Text, Qt::gray);
  pal = new QPalette;
  pal->setColor(QPalette::Background ,QColor(Qt::black));
  
//==========================

  QSound::play("sound\\start.wav");
  
  help = new QLabel;
  help->setVisible(help_show);
  mainL = new QVBoxLayout;
  setupLevel();
  setupTimerWindow();

  setLayout(mainL);
  
  timer = new QTimer(this);
  connect(timer, SIGNAL(timeout()), SLOT(updateCaption()));
  connect(this, SIGNAL(keyPressEvent(QKeyEvent * event)), this, SLOT(keyPressEvent(QKeyEvent * event)));
  

  com0label->setText(command0name);
  com1label->setText(command1name);  

  point0 = point1 = 0;

  level = -1;
  GetNextLevel(&level);
  newLevel(level);
}

void Window::CheckWin(int level)
{
  int sum=0;
  switch (level)
  {
    case ROUND_1: case ROUND_2: case ROUND_3:
    case ROUND_OBR: 
      sum = (activecommand) ? point1 : point0;
      break;
    case ROUND_SUPER:
      sum = user1voice[5]->text().toInt();
      break;
  }

  if (sum >= winpoint)
  {
    QSound::play("sound\\win.wav");  
  }
}

bool Window::GetNextLevel(int *plevel)
{
  if (*plevel < -1 || *plevel > ROUND_LAST)
  { *plevel = -1;
    return FALSE;
  }
  else
  for (int i=*plevel+1;i<ROUND_LAST;i++)
    if (Rounds[i])
    { *plevel = i;
      return TRUE;
    }
  *plevel = WIN_ROUND;
  return FALSE;
}

Window::~Window()
{
  SaveSettings(SETT_FILE_PATH);
}

static char szcommand0name[] = "szcommand0name";
static char szcommand1name[] = "szcommand1name";
static char szDefCommand0Name[] = "Команда 1";
static char szDefCommand1Name[] = "Команда 2";
static char szDefQuestion[] = "Вопрос";
static char szDefAnswer[] = "Ответ";

static char szROUND_1[] = "ROUND_1";
static char szROUND_2[] = "ROUND_2";
static char szROUND_3[] = "ROUND_3";
static char szROUND_OBR[] = "ROUND_OBR";
static char szROUND_SUPER[] = "ROUND_SUPER";

static char sztime1[] = "time1";
static char sztime2[] = "time2";
static char sztime3[] = "time3";
static char szwinpoint[] = "winpoint";

static char szquestion[] = "ques";
static char szanswer[] = "answ";
static char szpoints[] = "points";


#define FONT_STYLE1 "Journal"
#define FONT_STYLE2 "Journal"
#define FONT_STYLE3 "Journal"
#define FONT_STYLEQ "Journal"

#define FONT_SIZE1 30
#define FONT_SIZE2 30
#define FONT_SIZE3 25
#define FONT_SIZEQ 30

static char szFontStyle1[] = "FontStyle1";
static char szFontStyle2[] = "FontStyle2";
static char szFontStyle3[] = "FontStyle3";
static char szFontStyleQ[] = "FontStyleQuestion";

static char szFontSize1[] = "FontSize1";
static char szFontSize2[] = "FontSize2";
static char szFontSize3[] = "FontSize3";
static char szFontSizeQ[] = "FontSizeQuestion";

void Window::LoadSettings(QString path)
{
  QSettings sett(path, QSettings::IniFormat);
  sett.setIniCodec(QTextCodec::codecForName("Windows-1251"));

  sett.beginGroup("MAIN");
  
  Rounds[ROUND_1] = sett.value(szROUND_1,TRUE).toBool();
  Rounds[ROUND_2] = sett.value(szROUND_2,TRUE).toBool();
  Rounds[ROUND_3] = sett.value(szROUND_3,TRUE).toBool();
  Rounds[ROUND_OBR] = sett.value(szROUND_OBR,TRUE).toBool();
  Rounds[ROUND_SUPER] = sett.value(szROUND_SUPER,TRUE).toBool();
  command0name = sett.value(szcommand0name,szDefCommand0Name).toString();
  command1name = sett.value(szcommand1name,szDefCommand1Name).toString();
    
  time1 = sett.value(sztime1, TIMER1).toInt();
  time2 = sett.value(sztime2, TIMER2).toInt();
  time3 = sett.value(sztime3, TIMER3).toInt();
  winpoint = sett.value(szwinpoint,WIN_POINT).toInt();

  fontQ = new QFont;
  fontQ->setFamily(sett.value(szFontStyleQ,FONT_STYLEQ).toString());
  fontQ->setPointSize(sett.value(szFontSizeQ,FONT_SIZEQ).toInt());

  font1 = new QFont;
  font1->setFamily(sett.value(szFontStyle1,FONT_STYLE1).toString());
  font1->setPointSize(sett.value(szFontSize1,FONT_SIZE1).toInt());

  font2 = new QFont;
  font2->setFamily(sett.value(szFontStyle2,FONT_STYLE2).toString());
  font2->setPointSize(sett.value(szFontSize2,FONT_SIZE2).toInt());
  font2->setUnderline(TRUE);
  font2->setBold(TRUE);

  fontNum = new QFont;
  fontNum->setFamily(sett.value(szFontStyle3,FONT_STYLE3).toString());
  fontNum->setPointSize(sett.value(szFontSize3,FONT_SIZE3).toInt());
  fontNum->setUnderline(FALSE);
  fontNum->setBold(FALSE);


  vopros = new Question[MAX_ROUND];
  QString qkey, skeyAnsw;
  for (int i=0;i<MAX_ROUND;i++)
  {
    qkey = QString(szquestion);
    qkey += QString::number(i);
    vopros[i].name = sett.value(qkey,qkey).toString();
    vopros[i].name.remove("\n");

    for (int j=0;j<MAX_QUESTION;j++)
    { 
      skeyAnsw = qkey;
      skeyAnsw+=QString(szanswer);
      skeyAnsw+=QString::number(j);
      vopros[i].answer[j] = sett.value(skeyAnsw,skeyAnsw).toString();
      skeyAnsw = qkey;
      skeyAnsw+=QString(szpoints);
      skeyAnsw+=QString::number(j);
      vopros[i].num[j]  = sett.value(skeyAnsw,skeyAnsw).toInt();
    }
  }
  curvopros = &vopros[0];

  sett.endGroup();
}

void Window::SaveSettings(QString path)
{
  QSettings sett(path, QSettings::IniFormat);
  sett.setIniCodec(QTextCodec::codecForName("Windows-1251"));

  sett.beginGroup("MAIN");

  sett.setValue(">>",QString("Включение/отключение раундов игры (true/false)"));
  sett.setValue(szROUND_1,Rounds[ROUND_1]);
  sett.setValue(szROUND_2,Rounds[ROUND_2]);
  sett.setValue(szROUND_3,Rounds[ROUND_3]);
  sett.setValue(szROUND_OBR,Rounds[ROUND_OBR]);
  sett.setValue(szROUND_SUPER,Rounds[ROUND_SUPER]);

  sett.setValue(szFontStyle1,font1->family());
  sett.setValue(szFontSize1,font1->pointSize());

  sett.setValue(szFontStyle2,font2->family());
  sett.setValue(szFontSize2,font2->pointSize());

  sett.setValue(szFontStyle3,fontNum->family());
  sett.setValue(szFontSize3,fontNum->pointSize());

  sett.setValue(szFontStyleQ,fontQ->family());
  sett.setValue(szFontSizeQ,fontQ->pointSize());

  sett.setValue(">>",QString("Названия команд"));
  sett.setValue(szcommand0name,command0name);
  sett.setValue(szcommand1name,command1name);

  
  sett.setValue(sztime1,time1);
  sett.setValue(sztime2,time2);
  sett.setValue(sztime3,time3);
  sett.setValue(szwinpoint,winpoint);

  QString qkey, skeyAnsw;
  for (int i=0;i<MAX_ROUND;i++)
  {
    qkey = QString(szquestion);
    qkey += QString::number(i);
    sett.setValue(qkey,vopros[i].name);
   
    for (int j=0;j<MAX_QUESTION;j++)
    { 
      skeyAnsw = qkey;
      skeyAnsw+=QString(szanswer);
      skeyAnsw+=QString::number(j);
      sett.setValue(skeyAnsw,vopros[i].answer[j]);
      skeyAnsw = qkey;
      skeyAnsw+=QString(szpoints);
      skeyAnsw+=QString::number(j);
      sett.setValue(skeyAnsw,vopros[i].num[j]);
    }
  }

  sett.endGroup();
}

void Window::setupLevel()
{
  
  pointLCD = new QLCDNumber;
    pointLCD->setDecMode();
  pointLCD->setPalette(*pal);
  pointLCD->setSegmentStyle(QLCDNumber::Filled);
  
  pointLCD0 = new QLCDNumber;
    pointLCD0->setDecMode();
  pointLCD0->setFixedSize(150,90);
  pointLCD0->setPalette(*pal);
  pointLCD0->setSegmentStyle(QLCDNumber::Filled);
  pointLCD1 = new QLCDNumber;
    pointLCD1->setDecMode();
  pointLCD1->setFixedSize(150,90);
  pointLCD1->setPalette(*pal);
  pointLCD1->setSegmentStyle(QLCDNumber::Filled);
  
  highL = new QHBoxLayout;
  
  com0label = new QLabel;
  com1label = new QLabel;
  com0label->setFont(*font1);
  com1label->setFont(*font1);
  com1label->setAlignment(Qt::AlignRight);
  com0label->setText(command0name);
  com1label->setText(command1name);
  highL->addWidget(com0label);
  highL->addWidget(pointLCD);
  highL->addWidget(com1label);

  lowL = new QHBoxLayout;
  lowwgt = new QWidget;
  lowwgt->setLayout(lowL);
  highwgt = new QWidget;
  highwgt->setLayout(highL);
  question = new QLabel;
  question->setAlignment(Qt::AlignCenter);
  question->setFont(*fontQ);
  
  mainL->addWidget(question);
  mainL->addWidget(highwgt);
  mainL->addWidget(lowwgt);

  ansL = new QVBoxLayout;

  for (int i=0;i<MAX_QUESTION+1;i++) 
  {
     QString url;
     url = QString("bmp\\answ_")+QString::number(i+1)+QString(".bmp");
     anslabel[i] = new QLabel;
     anslabel[i]->setFont(*font1);
     anslabel[i]->setPixmap(QPixmap(url));
     ansL->addWidget(anslabel[i]);
  }
  ansL->addWidget(help);
  
  answgt = new QWidget;
  answgt->setLayout(ansL);
  
  com0L = new QVBoxLayout;
  com1L = new QVBoxLayout;

  gamelabel0 = new QLabel;
  gamelabel1 = new QLabel;
  gamelabel0->setPixmap(QPixmap("game_1"));
  gamelabel1->setPixmap(QPixmap("game_1"));
  com0L->addWidget(gamelabel0,Qt::AlignCenter);
  com0L->addWidget(pointLCD0,Qt::AlignCenter);
  com1L->addWidget(gamelabel1,Qt::AlignCenter);
  com1L->addWidget(pointLCD1,Qt::AlignCenter);
  
  //==================BAD========
  com0badL = new QVBoxLayout;
  com1badL = new QVBoxLayout;
  for (int i=0;i<MAX_BAD;i++) 
  { 
      bad0label[i] = new QLabel;
      bad1label[i] = new QLabel;
    bad0label[i]->setPixmap(QPixmap("bmp\\_x_0.bmp"));
    bad1label[i]->setPixmap(QPixmap("bmp\\_x_0.bmp"));
    com0badL->addWidget(bad0label[i],Qt::AlignCenter); 
    com1badL->addWidget(bad1label[i],Qt::AlignCenter); 
  };
  
  com0badwgt = new QWidget;
  com1badwgt = new QWidget;
  com0badwgt->setLayout(com0badL);
  com1badwgt->setLayout(com1badL);
  //==================BAD========
  
  com0L->addWidget(com0badwgt,Qt::AlignCenter);
  com1L->addWidget(com1badwgt,Qt::AlignCenter);
  
  com0wgt = new QWidget;
  com1wgt = new QWidget;
  
  com0wgt->setLayout(com0L);
  com1wgt->setLayout(com1L);
  
  lowL->addWidget(com0wgt,Qt::AlignCenter);
  lowL->addWidget(answgt,Qt::AlignCenter);
  lowL->addWidget(com1wgt,Qt::AlignCenter);
}

void Window::calcsum()
{
  int sum, sum2;
  sum=0;
  sum2 = 0;
  for (int i=0;i<MAX_SUPERGAME_QUESTION;i++)
  {
    sum += user0voice[i]->text().toInt();
    sum2 += user1voice[i]->text().toInt();
  }
  sum2 += sum;
  
  user1voice[5]->setText(QString::number(sum2));
  
  if (sum2 > WIN_POINT)
  {
    QPalette pal;
    pal.setColor(QPalette::Text, Qt::red);
    user1voice[5]->setPalette(pal);
  } else 
  {
    QPalette pal;
    pal.setColor(QPalette::Text, Qt::black);
    user1voice[5]->setPalette(pal);
  }

  user1lbl[5]->setText("ИТОГО:");
  user0sum = sum;
}

void Window::setupBigGame()
{
    t = 0;
  timer_on = FALSE;
  biggamewgt = new QWidget;
  hboxlayout  = new QHBoxLayout;; 

  user0wgtnum = new QWidget;
  user1wgtnum = new QWidget;
  user0wgt = new QWidget;
  user1wgt = new QWidget;
  user0wgtvoice = new QWidget;
  user1wgtvoice = new QWidget;

  user0numlayout = new QVBoxLayout;
  user1numlayout = new QVBoxLayout;
  user0layout = new QVBoxLayout;
  user1layout = new QVBoxLayout;
  user0voicel = new QVBoxLayout;
  user1voicel = new QVBoxLayout;  
  
  user0numlayout->setAlignment(Qt::AlignTop);
  user1numlayout->setAlignment(Qt::AlignTop);
  user0layout->setAlignment(Qt::AlignTop);
  user1layout->setAlignment(Qt::AlignTop);
  user0voicel->setAlignment(Qt::AlignTop);
  user1voicel->setAlignment(Qt::AlignTop);
  
  hideans = new QPushButton("Закр.ответы");
  hideans->setFixedSize(150,40);
  but = new QPushButton("Сумма");  
  but->setFixedSize(150,40);
  timerButton = new QPushButton("Таймер");
  timerButton->setFixedSize(150,40);
  
  for (int i=0;i<MAX_QUESTION;i++)
  {
    user0num[i] = new QLineEdit;
    user0lbl[i] = new QLineEdit;
    user0voice[i] = new QLineEdit;
    user1num[i] = new QLineEdit;
    user1lbl[i] = new QLineEdit;
    user1voice[i] = new QLineEdit;

    user0num[i]->setFont(*fontNum);
    user0num[i]->setFixedSize(50,60);
    if (i != 5) 
      user0num[i]->setText(QString::number(i+1)+".");
    user0num[i]->setPalette(*pal3);
    user0num[i]->setReadOnly(TRUE);      
    
    user0lbl[i]->setFont(*font1);
    user0lbl[i]->setFixedSize(400,60);
    user0voice[i]->setFont(*font1);
    user0voice[i]->setFixedSize(100,60);

    user1num[i]->setFont(*fontNum);
    user1num[i]->setFixedSize(50,60);
    if (i != 5) 
      user1num[i]->setText(QString::number(i+1)+".");
    user1num[i]->setPalette(*pal3);
    user1num[i]->setReadOnly(TRUE);  
    
    user1lbl[i]->setFont(*font1);
    user1lbl[i]->setFixedSize(400,60);
    user1voice[i]->setFont(*font1);
    user1voice[i]->setFixedSize(100,60);
    user1lbl[i]->setAlignment(Qt::AlignRight);
  
    user0numlayout->addWidget(user0num[i]);
    user0layout->addWidget(user0lbl[i]);
    user0voicel->addWidget(user0voice[i]);
    user1numlayout->addWidget(user1num[i]);
    user1layout->addWidget(user1lbl[i]);
    user1voicel->addWidget(user1voice[i]);    
  }
  
  user0num[5]->hide();
  user1num[5]->hide();
    user0lbl[5]->hide();//setReadOnly(TRUE);
  user0voice[5]->hide();//setReadOnly(TRUE);  
    user1lbl[5]->setReadOnly(TRUE);
  user1voice[5]->setReadOnly(TRUE);

  user0wgtnum->setLayout(user0numlayout);
  user1wgtnum->setLayout(user1numlayout);
  user0wgt->setLayout(user0layout);
  user1wgt->setLayout(user1layout);
  user0wgtvoice->setLayout(user0voicel);
  user1wgtvoice->setLayout(user1voicel);
  
  hboxlayout->addWidget( user0wgtnum);
  hboxlayout->addWidget( user0wgt);
  hboxlayout->addWidget( user0wgtvoice);
  hboxlayout->addWidget( user1wgtnum);
  hboxlayout->addWidget( user1wgtvoice);
  hboxlayout->addWidget( user1wgt);

  if (point0 >= point1) 
    str = command0name; 
  else 
    str = command1name;

  connect(timerButton, SIGNAL(clicked()), this, SLOT(startTimer()));
  connect(but, SIGNAL(clicked()), this, SLOT(calcsum()));
  connect(hideans, SIGNAL(clicked()), this, SLOT(hideAnswer()));
  
  bgstr =  new QString;
  *bgstr = QString("СУПЕР ИГРА\n c командой ") + str;
  question->setText(*bgstr);  

  buttonHl = new QHBoxLayout;
  buttonHl->setAlignment(Qt::AlignCenter);
  butwgt = new QWidget;
  
  buttonHl->addWidget(hideans);
  buttonHl->addWidget(timerButton);
  buttonHl->addWidget(but);
  
  butwgt->setLayout(buttonHl);
  
  biggamewgt->setLayout(hboxlayout);
  biggamelayout->addWidget(biggamewgt);
  biggamelayout->addWidget(butwgt);

  biggamelayout->addWidget(help);
}

void Window::hideAnswer()
{
  for (int i=0;i<MAX_SUPERGAME_QUESTION;i++)
  {
    user0lbl[i]->setVisible(!user0lbl[i]->isVisible());
    user0voice[i]->setVisible(!user0voice[i]->isVisible());
  }
  user0lbl[5]->setVisible(!user0lbl[5]->isVisible());
  user0voice[5]->setVisible(!user0voice[5]->isVisible());
}

void Window::startTimer()
{
  if (!user0sum) t = time1; else t = time2;
  if (t < 0) return;
  Timer(t);
}    
void Window::openAnswer(int i)
{
  
  if (anslabel[i]->text().size() > 2) 
    return;
  
  QSound::play("sound\\open.wav"); 
  
  anslabel[i]->setText(curvopros->answer[i] + " " + QString::number(curvopros->num[i]));
  
  openanswer++;
  
  if (winner && !obrat) 
    return;
  
  if (( level >=ROUND_1 && level <=ROUND_3)) 
    points += curvopros->num[i]*(level+1); 
  else 
    points = curvopros->num[i];//ROUND_OBR
  
  pointLCD->display(points);

}

void Window::setActiveCommand(int i)
{
  if (i) { activecommand = 1;
  com1label->setFont(*font2);  
  com0label->setFont(*font1);
  curbadlabel = bad1label[0];
  }
  else { activecommand = 0; 
  com0label->setFont(*font2);  
  com1label->setFont(*font1);
  curbadlabel = bad0label[0];
  }
}

void Window::addPoint(int i)
{
  if (i)   
    point1 += points;   
  else  
    point0 +=points;
    
  points = 0;
  pointLCD->display(points);
  pointLCD0->display(point0);
  pointLCD1->display(point1);
  
  winner = TRUE;
  game1 = FALSE;
  game2 = FALSE;
  
  if (obrat)   
    winner = FALSE;
}

void Window::setupGame()
{
  sg_setupgame = new QWidget;
  sg_lbl1 = new QLabel;
  sg_lbl2 = new QLabel;
  sg_setuplbl = new QLabel;
  sg_name1 = new QLineEdit;
  sg_name2 = new QLineEdit;
  sg_setup1v = new QVBoxLayout;
  sg_setup2v = new QVBoxLayout;
  sg_com1w = new QWidget;
  sg_com2w = new QWidget;
  sg_setupHbox = new QHBoxLayout;
  sg_commands = new QWidget;
  sg_setupVbox = new QVBoxLayout;
  sg_button = new QPushButton;
  
  sg_button->setText("OK");
  sg_button->setFont(*fontNum);
  sg_lbl1->setText("Команда 1");
  sg_lbl1->setFont(*fontNum);
  sg_lbl2->setText("Команда 2");
  sg_lbl2->setFont(*fontNum);
  sg_setuplbl->setText("Введите названия команд");
  sg_name1->setFixedSize(300,60);
  sg_name1->setFont(*font1);
  sg_name2->setFixedSize(300,60);
  sg_name2->setFont(*font1);
  
  sg_setup1v->addWidget(sg_lbl1);
  sg_setup1v->addWidget(sg_name1);
  sg_setup2v->addWidget(sg_lbl2);
  sg_setup2v->addWidget(sg_name2);
  sg_com1w->setLayout(sg_setup1v);
  sg_com2w->setLayout(sg_setup2v);
  
  sg_setupHbox->addWidget(sg_com1w);
  sg_setupHbox->addWidget(sg_com2w);
  
  sg_commands->setLayout(sg_setupHbox);
  
  sg_setupVbox->addWidget(sg_setuplbl);
  sg_setupVbox->addWidget(sg_commands);
  sg_setupVbox->addWidget(sg_button);
  
  connect(sg_button, SIGNAL(clicked()), this, SLOT(setupGameOk()));
  
  sg_setupgame->setLayout(sg_setupVbox);
  
  sg_setupgame->show();
}

void Window::setupGameOk()
{
  command0name = sg_name1->text();
  command1name = sg_name2->text();
  com0label->setText(command0name);
  com1label->setText(command1name);
  sg_setupgame->close();
}

void Window::keyPressEvent(QKeyEvent * event)
{
   switch(event->key())
   {
    case Qt::Key_F2: setupGame();
    break;
    case Qt::Key_F1: 
             help_show = !help_show;
             help->setVisible(help_show);
    break;
      case Qt::Key_1: 
            if (level != ROUND_SUPER) 
            { 
              if (question->text() == curvopros->name) 
                openAnswer(0);
            }
            else 
            {
              user0lbl[0]->setVisible(!user0lbl[0]->isVisible());
              user0voice[0]->setVisible(!user0voice[0]->isVisible());          
            }
    break;
      case Qt::Key_2: 
            if (level !=ROUND_SUPER ) 
            { 
              if (question->text() == curvopros->name) 
                openAnswer(1);
            }
            else 
            {
              user0lbl[1]->setVisible(!user0lbl[1]->isVisible());
              user0voice[1]->setVisible(!user0voice[1]->isVisible());          
            }
    break;
      case Qt::Key_3: 
            if (level != ROUND_SUPER ) 
            { 
              if (question->text() == curvopros->name) 
                openAnswer(2);
            }
            else 
            {
              user0lbl[2]->setVisible(!user0lbl[2]->isVisible());
              user0voice[2]->setVisible(!user0voice[2]->isVisible());          
            }
    break;
      case Qt::Key_4: 
            if (level != ROUND_SUPER ) 
            { 
              if (question->text() == curvopros->name) 
                openAnswer(3);
            }
            else 
            {
              user0lbl[3]->setVisible(!user0lbl[3]->isVisible());
              user0voice[3]->setVisible(!user0voice[3]->isVisible());          
            }
    break;
      case Qt::Key_5: 
            if (level != ROUND_SUPER ) 
            { 
              if (question->text() == curvopros->name) 
                openAnswer(4);
            }
            else 
            {
              user0lbl[4]->setVisible(!user0lbl[4]->isVisible());
              user0voice[4]->setVisible(!user0voice[4]->isVisible());          
            }
    break;
    case Qt::Key_6: 
            if (level != ROUND_SUPER && question->text() == curvopros->name) 
              openAnswer(5);
    break;  
    case Qt::Key_Q: 
            if (obrat) 
            { setActiveCommand(1);
              addPoint(0);
              CheckWin(level);
            }
            if (level == ROUND_SUPER) 
              startTimer();
    break;  
    case Qt::Key_W: 
            if (obrat) 
            { setActiveCommand(1);
              addPoint(1);
              CheckWin(level);
            }
    break;
    case Qt::Key_A: 
            if (level != ROUND_SUPER) 
              return;
            hideAnswer();
    break;
    case Qt::Key_Up:
       switch (level)
       {
         case ROUND_1: case ROUND_2: case ROUND_3:
              if (zhreby) //жеребьевка
              {    
                question->setText(curvopros->name);
                help->setText ("1...6 - открыть ответы, up - начать игру 1");
                if (openanswer > 0) 
                {
                  help->setText ("Игра №" + QString::number(level+1) + ", Раунд 1: 1...6 - открыть ответы, < > - выбрать команду, del - не правильный ответ");
                  zhreby = FALSE;
                  game1 = TRUE;
                }
              }
              else 
              if (game1 && openanswer < MAX_QUESTION) 
                return; //играет 1я команда
              else 
              if (game1 && openanswer == MAX_QUESTION)
              {
                addPoint(activecommand);
                help->setText ("Игра №" + QString::number(level+1) + ", Раунд 2: up - следующая игра");
              }
              else 
              if (game2 && !winner) //2я команда ответила, надо перечислить очки
              {
                if (badAnswer[activecommand] > 0) //выиграла первая команда
                  addPoint(!activecommand);
                else 
                  addPoint(activecommand);

                help->setText ("Игра №" + QString::number(level+1) + ", Раунд 2: 1...6 - открыть ответы, up - следующая игра");
              }
              else 
              if (winner)
              {
                if (GetNextLevel(&level))
                  newLevel(level);
                else
                  CheckWin(level);
              }         
         break;    
         case ROUND_OBR: //игра наоборот
              if (zhreby) //жеребьевка
              {    
                question->setText(curvopros->name);
                Timer(TIMER3);
                if (openanswer == 0) 
                {
                  zhreby = FALSE;
                  obrat = TRUE;
                }
              }
              else 
              if (openanswer == MAX_QUESTION )
              {
                if (GetNextLevel(&level))
                  newLevel(level);
                else
                  CheckWin(level);
              }      
              break;
        case ROUND_SUPER: //up
                  CheckWin(level);
         break;
         default:
         break;
       }
    break;
    case Qt::Key_Delete: 
      if (level !=ROUND_SUPER) 
        BadAnswer(); 
      else 
        Beep();
    break;
    case Qt::Key_Left: 
      if (game1) 
        setActiveCommand(0);
    break;
    case Qt::Key_Right: 
      if (game1) 
        setActiveCommand(1);
    break;
   }
}

void Window::setupTimerWindow()
{
  timerlbl = new QLabel;
  timerlbl->setText("Осталось");
  timerlbl->setFont(*font1);
  
  seclabel = new QLabel;
  seclabel->setFont(*font1);
  seclabel->setAlignment(Qt::AlignCenter);
  
  timerVl = new QVBoxLayout;
  timerVl->addWidget(timerlbl);
  timerVl->addWidget(seclabel);
  
  timerwgt = new QWidget;
  timerVwgt = new QWidget;
  timerVwgt->setLayout(timerVl);
  
  timerpic = new QLabel;
  timerpic->setPixmap(QPixmap("bmp\\timer.bmp"));
  timerHl = new QHBoxLayout;
  timerHl->addWidget(timerpic);
  timerHl->addWidget(timerVwgt);
  
  timerwgt->setLayout(timerHl);
}

void Window::Timer(int i)
{
  t = i;
  if (i <= 0) return;

  seclabel->setText(QString::number(t));
  
  timerwgt->show();
  
  timer->start(1000); 
  seclabel->setText(QString::number(t)+ "сек");
}

void Window::updateCaption()
{
  t--;
  timer->stop();
  if (t < 0) 
  {
    seclabel->setText("");
    timerwgt->close();
    timer_on = FALSE;
    return;
  }  
  timer->start(1000); 
  seclabel->setText(QString::number(t)+ "сек");
}

void Window::Beep()
{
  QSound::play("sound\\bad.wav"); 
}

void Window::SetTitleLabel(int i)
{
  switch(i)
  {
     case ROUND_1: question->setText("ПРОСТАЯ ИГРА");
     break;
     case ROUND_2: question->setText("ДВОЙНАЯ ИГРА");
     break;
     case ROUND_3: question->setText("ТРОЙНАЯ ИГРА");
     break;
     case ROUND_OBR: question->setText("ОБРАТНАЯ ИГРА");
     break; 
     case ROUND_SUPER: question->setText("БОЛЬШАЯ ИГРА");
  }
}

void Window::newLevel(int i)
{
  zhreby = game1 = game2 = supergame = obrat = FALSE;
  QSound::play("sound\\level.wav"); 
  SetTitleLabel(i);
  curvopros = &vopros[i];
  openanswer = 0;
  points = 0;      
  winner = FALSE;
  str = QString("bmp\\game_")+QString::number(i+1)+QString(".bmp");
  badAnswer[0]=badAnswer[1]=0;
  activecommand = 0;
  user0sum = 0;
    
  switch (i)
  {
    case ROUND_1: case ROUND_2: case ROUND_3: 
    zhreby = TRUE;
    
    clearBadAnswer();
    closeAnswers();  
    
    com0label->setFont(*font1);
    com1label->setFont(*font1);
  
    gamelabel0->setPixmap(QPixmap(str));
    gamelabel1->setPixmap(QPixmap(str));
    
    pointLCD->display(points);
    pointLCD0->display(point0);
    pointLCD1->display(point1);
    
    help->setText("up - открыть вопрос, начать игру");
    
  break;
  case ROUND_OBR:
    zhreby = TRUE;
    clearBadAnswer();
    closeAnswers();  
    
    gamelabel0->setPixmap(QPixmap(str));
    gamelabel1->setPixmap(QPixmap(str));
    
    pointLCD->display(points);
    pointLCD0->display(point0);
    pointLCD1->display(point1);
    
    help->setText("Игра наоборот: up - открыть вопрос, 1..6 - открыть вопрос, q - ком.1, w - ком.2");
  break;
  case ROUND_SUPER:
    supergame = TRUE;
    help->setText("a - скрыть ответы 1го игрока, q - таймер, del - повторный ответ, up - звук итог");

    biggamelayout = new QVBoxLayout;
    delete lowwgt->layout();
    com0label->setText("Игрок 1");
    com1label->setText("Игрок 2");
    if (point0 >= point1) 
      pointLCD->display(point0); 
    else 
      pointLCD->display(point1);
    com0wgt->close();
    com0wgt->close();
    answgt->close();
    com1wgt->close();
    setupBigGame();  
    lowwgt->setLayout(biggamelayout);
    QSound::play("sound\\level.wav"); 
    
  break;
  default:
  break;
  }
  
}
void Window::BadAnswer()
{
  if (badAnswer[0] > 0 && badAnswer[1] > 0) 
    return;
  
  QSound::play("sound\\bad.wav"); 

  if (activecommand) 
    curbadlabel = bad1label[badAnswer[activecommand]]; 
  else 
    curbadlabel = bad0label[badAnswer[activecommand]]; 
  
  curbadlabel->setPixmap(QPixmap("bmp\\_x_1.bmp"));
  
  badAnswer[activecommand]++;
  
  if (badAnswer[activecommand] == MAX_BAD) 
  {
    setActiveCommand(!activecommand);    
    game1 = FALSE;
    game2 = TRUE;
    
    help->setText ("Игра №" + QString::number(level+1) + ", Раунд 2: 1...6 - открыть ответы, up - перечислить очки, del - не правильный ответ");
  }
}

void Window::closeAnswers()
{
  for (int i=0;i<MAX_QUESTION;i++) 
  {
     QString url;
     url = QString("bmp\\answ_")+QString::number(i+1)+QString(".bmp");
     anslabel[i]->setText("");
     anslabel[i]->setPixmap(QPixmap(url));
  }
}

void Window::clearBadAnswer()
{
  for (int i=0;i<MAX_BAD;i++)
  {
     bad0label[i]->setPixmap(QPixmap("bmp\\_x_0.bmp"));
     bad1label[i]->setPixmap(QPixmap("bmp\\_x_0.bmp"));
  }
  badAnswer[0] = badAnswer[1] = 0;
}
