//初始化
$.mockjax({
	url: 'Common/init.aspx',
	responseText:{
  		Sex:"man",
		status:-1,
	}
});
//提交信息
$.mockjax({
	url: 'Common/ZhuChe.aspx',
	responseText:{
  		"status": 1
	}
});
//提交分数
$.mockjax({
	url: 'Common/TuInfo.aspx',
	responseText:{
  		"status": 1,
		"Frequency":1
	}
});
//获取分享页面数据
$.mockjax({
	url: 'Common/SelectTuInfo.aspx',
	responseText:{
  		Imageid:"img/role.png",
		Guid:"fdasfdsa",
		Diansum:500,
		DeFen:90,
		type:1,//用户状态 自己:1 其他用户:2
		tip:1,
		name:"xxx",
		Frequency:1,
		status:1,
		content:""
	}
});
//点赞
$.mockjax({
	url: 'Common/DianZan.aspx',
	responseText:{
  		"status": 1//点赞成功:1 不可以给自己点赞:-2 不可重复点赞:-3
	}
});
//抽奖
$.mockjax({
	url: 'Common/exchange.aspx',
	responseText:{
  		"status": 1,//用户已中奖返回：-2, 抽奖次数已用完：-3, 抽中返回：1，其他值：数据错误
		"Frequency":0,
		"index":5
	}
});