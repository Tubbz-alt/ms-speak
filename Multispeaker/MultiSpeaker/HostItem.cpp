/*-------------------------------------------------------------------------------

  Multi-Speak - Secure Protocol Enterprise Access Kit(MS_SPEAK)
  Copyright © 2018, Battelle Memorial Institute
  All rights reserved.
  1.	Battelle Memorial Institute (hereinafter Battelle) hereby grants permission to any person or
		entity lawfully obtaining a copy of this software and associated documentation files
		(hereinafter “the Software”) to redistribute and use the Software in source and binary forms,
		with or without modification.  Such person or entity may use, copy, modify, merge, publish,
		distribute, sublicense, and/or sell copies of the Software, and may permit others to do so,
		subject to the following conditions:
		•	Redistributions of source code must retain the above copyright notice, this list of
			conditions and the following disclaimers.
		•	Redistributions in binary form must reproduce the above copyright notice, this list of
			conditions and the following disclaimer in the documentation and/or other materials
			provided with the distribution.
		•	Other than as used herein, neither the name Battelle Memorial Institute or Battelle may
			be used in any form whatsoever without the express written consent of Battelle.

  2.	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
		OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY
		AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL BATTELLE OR CONTRIBUTORS
		BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
		(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
		OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
		CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
		OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


  This material was prepared as an account of work sponsored by an agency of the United States Government.
  Neither the United States  Government nor the United States Department of Energy, nor Battelle, nor
  any of their employees, nor any jurisdiction or organization  that has cooperated in the development
  of these materials, makes any warranty, express or implied, or assumes any legal liability or
  responsibility for the accuracy, completeness, or usefulness or any information, apparatus, product,
  software, or process disclosed, or represents that its use would not infringe privately owned rights.
  Reference herein to any specific commercial product, process, or service by trade name, trademark,
  manufacturer, or otherwise does not necessarily constitute or imply its endorsement, recommendation, or
  favoring by the United States Government or any agency thereof, or Battelle Memorial Institute. The
  views and opinions of authors expressed herein do not necessarily state or reflect those of the
  United States Government or any agency thereof.
									 PACIFIC NORTHWEST NATIONAL LABORATORY
											    operated by
												  BATTELLE
											      for the
									  UNITED STATES DEPARTMENT OF ENERGY
									   under Contract DE-AC05-76RL01830


    This notice including this sentence must appear on any copies of this computer software.
*/
//-------------------------------------------------------------------------------
//	History
//		2017 - Created By: Lance Irvine.
//		2018 - Modified By: Carl Miller <carl.miller@pnnl.gov>
//-------------------------------------------------------------------------------
//
// Summary: HostItem.cpp
//-------------------------------------------------------------------------------

#include <QGraphicsScene>
#include <QGraphicsSceneDragDropEvent>
#include <QGraphicsSceneMouseEvent>
#include <QPainter>

#include "AnimatedLineItem.h"
#include "HostItem.h"
#include "HostScene.h"
#include "WebServiceInfo.h"

const int NODE_SIZE = 50;

const QString TOOL_TIP = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\"><html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">p, li { white-space: pre-wrap; }</style></head><body style=\" font-family:'MS Shell Dlg 2'; font-size:8pt; font-weight:400; font-style:normal;\"><p style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-size:12pt; font-weight:600;\">TokenLong</span></p><p style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\">ID: TokenId</p><p style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\">Apache: TokenApache</p><p style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\">Firefox: TokenFireFox</p><p style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\">Wireshark: TokenWireshark</p><p style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\">Terminal: TokenTerminal</p><p style=\"-qt-paragraph-type:empty; margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px; font-size:12pt;\"><br /></p></body></html>";

//------------------------------------------------------------------------------
// HostItem
//
HostItem::HostItem(Host& host, const QPointF& origin, QGraphicsItem* parent)
  : QGraphicsObject(parent),
  m_host(host),
  m_origin(origin)
{
  setPos(origin.x() - (qreal)NODE_SIZE / 2.0, origin.y() - (qreal)NODE_SIZE / 2.0);
  setAcceptDrops(true);
  setAcceptHoverEvents(true);
  setFlags(QGraphicsItem::ItemIsSelectable | QGraphicsItem::ItemIsMovable | QGraphicsItem::ItemSendsGeometryChanges);
  setZValue(10);
  setToolTip(ToolTip());
}
//------------------------------------------------------------------------------
// ~HostItem
//
HostItem::~HostItem()
{
}
//------------------------------------------------------------------------------
// boundingRect
//
QRectF HostItem::boundingRect() const
{
  return QRectF(0,0,NODE_SIZE,NODE_SIZE);
}
//------------------------------------------------------------------------------
// Size
//
int HostItem::Size()
{
  return NODE_SIZE;
}
//------------------------------------------------------------------------------
// shape
//
QPainterPath HostItem::shape() const
{
  QPainterPath path;
  path.addRect(QRectF(0,0,NODE_SIZE,NODE_SIZE));
  return path;
}
//------------------------------------------------------------------------------
// ToolTip
//
QString HostItem::ToolTip() const
{
  QString tip = TOOL_TIP;
  //tip.replace("TokenShort", m_host.Name());
  tip.replace("TokenLong", WsInfo().FullNameDashSep(m_host.Name()));
  tip.replace("TokenId", QString::number(m_host.Id()));
  tip.replace("TokenApache", (m_host.AppFlag(Host::Apache)) ? "Yes" : "No");
  tip.replace("TokenFireFox", (m_host.AppFlag(Host::FireFox)) ? "Yes" : "No");
  tip.replace("TokenWireshark", (m_host.AppFlag(Host::WireShark)) ? "Yes" : "No");
  tip.replace("TokenTerminal", (m_host.AppFlag(Host::Terminal)) ? "Yes" : "No");
  return tip;
}
//------------------------------------------------------------------------------
// paint
//
void HostItem::paint(QPainter* painter, const QStyleOptionGraphicsItem* option, QWidget* w)
{
  Q_UNUSED(option);
  Q_UNUSED(w);
  QPixmap pix = Hosts().CreateHostPixmap(m_host, NODE_SIZE, isSelected());
  painter->drawPixmap(0, 0, NODE_SIZE, NODE_SIZE, pix);
}

//------------------------------------------------------------------------------
// itemChange
//
QVariant HostItem::itemChange(GraphicsItemChange change, const QVariant& value)
{
  if (change == QGraphicsItem::ItemPositionChange) 
  {
    m_origin = pos() + QPointF(NODE_SIZE/2, NODE_SIZE/2);    
    foreach (AnimatedLineItem* edge, m_edges) 
      edge->UpdatePosition();
    scene()->update();
  }
  else if (change == QGraphicsItem::ItemSelectedHasChanged)
  {
    if (value.toBool())
      qDebug() << "Item Selected:" << Name();
  }

  return value;
}
//------------------------------------------------------------------------------
// mouseMoveEvent
//
void HostItem::mouseMoveEvent(QGraphicsSceneMouseEvent* e)
{
  QGraphicsItem::mouseMoveEvent(e); // move the item...

  // ...then check the bounds
  if (x() < 0)
      setPos(0, y());
  else if (x() > scene()->sceneRect().width())
      setPos(scene()->sceneRect().width(), y());

  if (y() < 0)
      setPos(x(), 0);
  else if (y() > scene()->sceneRect().height())
      setPos(x(), scene()->sceneRect().height());
}