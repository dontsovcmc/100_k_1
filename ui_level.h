/********************************************************************************
** Form generated from reading ui file 'level.ui'
**
** Created: Fri 21. Jan 18:37:39 2011
**      by: Qt User Interface Compiler version 4.3.0
**
** WARNING! All changes made in this file will be lost when recompiling ui file!
********************************************************************************/

#ifndef UI_LEVEL_H
#define UI_LEVEL_H

#include <QtCore/QVariant>
#include <QtGui/QAction>
#include <QtGui/QApplication>
#include <QtGui/QButtonGroup>
#include <QtGui/QDialog>
#include <QtGui/QLCDNumber>
#include <QtGui/QLabel>
#include <QtGui/QVBoxLayout>
#include <QtGui/QWidget>

class Ui_LevelWidget
{
public:
    QLCDNumber *lcdNumber;
    QWidget *verticalLayout;
    QVBoxLayout *vboxLayout;
    QLabel *label_2;
    QLabel *label_3;
    QLabel *label_5;
    QLabel *label_4;
    QLabel *label_6;
    QLabel *label;
    QWidget *verticalLayout_2;
    QVBoxLayout *vboxLayout1;
    QLabel *label_9;
    QLabel *label_7;
    QLabel *label_8;
    QWidget *verticalLayout_3;
    QVBoxLayout *vboxLayout2;
    QLabel *label_13;
    QLabel *label_14;
    QLabel *label_15;

    void setupUi(QDialog *LevelWidget)
    {
    if (LevelWidget->objectName().isEmpty())
        LevelWidget->setObjectName(QString::fromUtf8("LevelWidget"));
    QSize size(1024, 768);
    size = size.expandedTo(LevelWidget->minimumSizeHint());
    LevelWidget->resize(size);
    lcdNumber = new QLCDNumber(LevelWidget);
    lcdNumber->setObjectName(QString::fromUtf8("lcdNumber"));
    lcdNumber->setGeometry(QRect(380, 20, 241, 91));
    verticalLayout = new QWidget(LevelWidget);
    verticalLayout->setObjectName(QString::fromUtf8("verticalLayout"));
    verticalLayout->setGeometry(QRect(180, 140, 652, 471));
    vboxLayout = new QVBoxLayout(verticalLayout);
    vboxLayout->setObjectName(QString::fromUtf8("vboxLayout"));
    vboxLayout->setContentsMargins(0, 0, 0, 0);
    label_2 = new QLabel(verticalLayout);
    label_2->setObjectName(QString::fromUtf8("label_2"));
    QFont font;
    font.setFamily(QString::fromUtf8("Trebuchet MS"));
    font.setPointSize(40);
    label_2->setFont(font);
    label_2->setPixmap(QPixmap(QString::fromUtf8("answ.jpg")));
    label_2->setAlignment(Qt::AlignCenter);

    vboxLayout->addWidget(label_2);

    label_3 = new QLabel(verticalLayout);
    label_3->setObjectName(QString::fromUtf8("label_3"));
    label_3->setFont(font);
    label_3->setPixmap(QPixmap(QString::fromUtf8("answ.jpg")));
    label_3->setAlignment(Qt::AlignCenter);

    vboxLayout->addWidget(label_3);

    label_5 = new QLabel(verticalLayout);
    label_5->setObjectName(QString::fromUtf8("label_5"));
    label_5->setFont(font);
    label_5->setPixmap(QPixmap(QString::fromUtf8("answ.jpg")));
    label_5->setAlignment(Qt::AlignCenter);

    vboxLayout->addWidget(label_5);

    label_4 = new QLabel(verticalLayout);
    label_4->setObjectName(QString::fromUtf8("label_4"));
    label_4->setFont(font);
    label_4->setPixmap(QPixmap(QString::fromUtf8("answ.jpg")));
    label_4->setAlignment(Qt::AlignCenter);

    vboxLayout->addWidget(label_4);

    label_6 = new QLabel(verticalLayout);
    label_6->setObjectName(QString::fromUtf8("label_6"));
    label_6->setFont(font);
    label_6->setPixmap(QPixmap(QString::fromUtf8("answ.jpg")));
    label_6->setAlignment(Qt::AlignCenter);

    vboxLayout->addWidget(label_6);

    label = new QLabel(verticalLayout);
    label->setObjectName(QString::fromUtf8("label"));
    label->setFont(font);
    label->setPixmap(QPixmap(QString::fromUtf8("answ.jpg")));
    label->setAlignment(Qt::AlignCenter);

    vboxLayout->addWidget(label);

    verticalLayout_2 = new QWidget(LevelWidget);
    verticalLayout_2->setObjectName(QString::fromUtf8("verticalLayout_2"));
    verticalLayout_2->setGeometry(QRect(20, 340, 122, 266));
    vboxLayout1 = new QVBoxLayout(verticalLayout_2);
    vboxLayout1->setObjectName(QString::fromUtf8("vboxLayout1"));
    vboxLayout1->setContentsMargins(0, 0, 0, 0);
    label_9 = new QLabel(verticalLayout_2);
    label_9->setObjectName(QString::fromUtf8("label_9"));
    label_9->setPixmap(QPixmap(QString::fromUtf8("x_0.jpg")));

    vboxLayout1->addWidget(label_9);

    label_7 = new QLabel(verticalLayout_2);
    label_7->setObjectName(QString::fromUtf8("label_7"));
    label_7->setPixmap(QPixmap(QString::fromUtf8("x_0.jpg")));

    vboxLayout1->addWidget(label_7);

    label_8 = new QLabel(verticalLayout_2);
    label_8->setObjectName(QString::fromUtf8("label_8"));
    label_8->setPixmap(QPixmap(QString::fromUtf8("x_0.jpg")));

    vboxLayout1->addWidget(label_8);

    verticalLayout_3 = new QWidget(LevelWidget);
    verticalLayout_3->setObjectName(QString::fromUtf8("verticalLayout_3"));
    verticalLayout_3->setGeometry(QRect(870, 340, 122, 266));
    vboxLayout2 = new QVBoxLayout(verticalLayout_3);
    vboxLayout2->setObjectName(QString::fromUtf8("vboxLayout2"));
    vboxLayout2->setContentsMargins(0, 0, 0, 0);
    label_13 = new QLabel(verticalLayout_3);
    label_13->setObjectName(QString::fromUtf8("label_13"));
    label_13->setPixmap(QPixmap(QString::fromUtf8("x_0.jpg")));

    vboxLayout2->addWidget(label_13);

    label_14 = new QLabel(verticalLayout_3);
    label_14->setObjectName(QString::fromUtf8("label_14"));
    label_14->setPixmap(QPixmap(QString::fromUtf8("x_0.jpg")));

    vboxLayout2->addWidget(label_14);

    label_15 = new QLabel(verticalLayout_3);
    label_15->setObjectName(QString::fromUtf8("label_15"));
    label_15->setPixmap(QPixmap(QString::fromUtf8("x_0.jpg")));

    vboxLayout2->addWidget(label_15);


    retranslateUi(LevelWidget);

    QMetaObject::connectSlotsByName(LevelWidget);
    } // setupUi

    void retranslateUi(QDialog *LevelWidget)
    {
    LevelWidget->setWindowTitle(QApplication::translate("LevelWidget", "\320\241\321\202\320\276 \320\272 1", 0, QApplication::UnicodeUTF8));
    label_2->setText(QString());
    label_3->setText(QString());
    label_5->setText(QString());
    label_4->setText(QString());
    label_6->setText(QString());
    label->setText(QString());
    label_9->setText(QString());
    label_7->setText(QString());
    label_8->setText(QString());
    label_13->setText(QString());
    label_14->setText(QString());
    label_15->setText(QString());
    Q_UNUSED(LevelWidget);
    } // retranslateUi

};

namespace Ui {
    class LevelWidget: public Ui_LevelWidget {};
} // namespace Ui

#endif // UI_LEVEL_H
