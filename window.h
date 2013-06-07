
#ifndef WINDOW_H
#define WINDOW_H

#include <QWidget>
#include <QMainWindow>

#define SHOW_QLIST_INT(strlist) QString mes; \
                               for (int ijh=0;ijh<strlist.size();ijh++) { \ mes+=QString::number(strlist.at(ijh)) + " ";\
                 } QMessageBox::information(this, "strlist",mes + "=" + \ QString::number(strlist.size()));


class QRadioButton;
class QAbstractItemModel;
class QCheckBox;
class QComboBox;
class QGroupBox;
class QLabel;
class QLineEdit;
class QSortFilterProxyModel;
class QTreeView;
class QPushButton;
class QButtonGroup;
class QVBoxLayout;
class QLCDNumber;
class QFont;
class QFontMetrics;
class QPainter;
class QHBoxLayout;
class QTimer;
class QPallete;
class QSettings;

#define MAS_SIZE 2000

struct Question {
QString name;
QString answer[6];
int num[6];
};

class Window : public QWidget
{
    Q_OBJECT

public:
    Window();
  void setupGame();
  void setupLevel();
  void loadFile(QString fileurl);
  void openAnswer(int i);
    void setActiveCommand(int i);
  void newLevel(int i);
  void BadAnswer();
  void clearBadAnswer();
  void addPoint(int i);
  void closeAnswers();
  void setupBigGame();
  void Timer(int i);
  void Beep();
  void SetTitleLabel (int i);
  void setupTimerWindow();
  void startTimer60();
  
public slots:
  void setupGameOk();
  void keyPressEvent(QKeyEvent *event);
  void updateCaption();
  void calcsum();
  void startTimer();
  void hideAnswer();
  
public: 
  /*layouts in levels */
  QVBoxLayout *mainL;
    QHBoxLayout *highL;
    QHBoxLayout *lowL;
      QVBoxLayout *com0L;
      QVBoxLayout *com0badL;
      QVBoxLayout *ansL;
    QVBoxLayout *com1L;
      QVBoxLayout *com1badL;

  /* widgets in levels */
  QLabel *question;
  QWidget *highwgt;
    QLabel *com0label;
    QLCDNumber *pointLCD;
    QLabel *com1label;  
  QWidget *lowwgt;
    QWidget *com0wgt;
      QLabel *gamelabel0; 
      QLCDNumber *pointLCD0; 
      QWidget *com0badwgt;
        QLabel *bad0label[3];
    QWidget *answgt;
      QLabel *anslabel[7];
    QWidget *com1wgt;
      QLabel *gamelabel1;
      QLCDNumber *pointLCD1;
      QWidget *com1badwgt;
        QLabel *bad1label[3];
  
  QWidget *biggame;

  QString *bgstr;

  QWidget *sg_setupgame;
  QLineEdit *sg_name1, *sg_name2;
  QLabel *sg_lbl1, *sg_lbl2, *sg_setuplbl;
  QVBoxLayout *sg_setupVbox, *sg_setup1v, *sg_setup2v;
  QHBoxLayout *sg_setupHbox;
  QWidget *sg_com1w, *sg_com2w, *sg_commands;
  QPushButton *sg_button;
  
  /* layouts in BIG game */
  QVBoxLayout *biggamelayout;
  QHBoxLayout *hboxlayout;
    QVBoxLayout *user0numlayout;
    QVBoxLayout *user1numlayout;
    QVBoxLayout *user0layout;
    QVBoxLayout *user1layout;
    QVBoxLayout *user0voicel;
    QVBoxLayout *user1voicel;  
  QHBoxLayout *buttonHl;
  /* widgets in BIG game */
  QWidget *biggamewgt;

    QWidget *user0wgtnum;
      QLineEdit *user0num[6];  
    QWidget *user1wgtnum;
      QLineEdit *user1num[6];
    QWidget *user0wgt;
      QLineEdit *user0lbl[6];
    QWidget *user1wgt;
      QLineEdit *user1lbl[6];
    QWidget *user0wgtvoice;
      QLineEdit *user0voice[6];
    QWidget *user1wgtvoice;
      QLineEdit *user1voice[6];
    QWidget *butwgt;
      QPushButton *timerButton;
      QPushButton *but;
      QPushButton *hideans;
    QLabel *help;
  
  QWidget *timerwgt;
    QHBoxLayout *timerHl;
      QLabel *timerpic;
      QVBoxLayout *timerVl; QWidget *timerVwgt;
        QLabel *timerlbl;
        QLabel *seclabel;

  QFontMetrics *fontmetr1;
  QFont *font1, *font2, *fontNum;
  QPainter *painter;
  QTimer *timer;
  
  int winpoint;
  int level;
  int activecommand;
  int points;
  int point0, point1;
  int badAnswer[2];
  int openanswer;
  bool winner;
  int user0sum;
  int t;
  int time1, time2, time3;
  bool timer_on;
  bool help_show;
  QString str;
  QString command0name, command1name;
  QPalette *pal3;
  QPalette *pal;

  Question *curvopros, *vopros;
  QLabel *curbadlabel;

  bool zhreby, game1, game2, supergame, obrat;
};

#endif
