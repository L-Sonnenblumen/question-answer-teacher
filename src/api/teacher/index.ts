import request from '@/client';

export const teacherApi = {
  login: (data) =>
    request({
      url: '/TEA_auth/login',
      method: 'post',
      data,
    }),
  logout: () =>
    request({
      url: '/TEA_auth/logout',
      method: 'get',
    }),
  overview: () =>
    request({
      url: 'TEA_dashboard/overview',
      method: 'get',
      data: {},
    }),
  // 班级列表 (你提供的示例)
  class_list: (keyword) =>
    request({
      url: '/TEA_class/list',
      method: 'post',
      data: { keyword },
    }),

  // 创建班级
  create_class: (data) =>
    request({
      url: '/TEA_class/create',
      method: 'post',
      data, // 参数: { class_name, grade_name, remark }
    }),

  // 获取班级详情
  class_detail: (class_id) =>
    request({
      url: '/TEA_class/detail',
      method: 'post',
      params: { class_id }, // query 参数使用 params
    }),

  // 编辑班级
  update_class: (data) =>
    request({
      url: '/TEA_class/update',
      method: 'post',
      data, // 参数: { class_id, class_name, grade_name, remark }
    }),

  // 删除班级
  delete_class: (class_id) =>
    request({
      url: '/TEA_class/delete',
      method: 'post',
      params: { class_id }, // query 参数使用 params
    }),

  // 班级学生列表
  class_students: (data) =>
    request({
      url: '/TEA_class/students',
      method: 'post',
      data, // 参数: { class_id }
    }),

  // 批量导入学生 (JSON)
  import_students: (data) =>
    request({
      url: '/TEA_class/import_students',
      method: 'post',
      data, // 参数: { class_id, students: [...] }
    }),

  // 批量导入学生 (XLSX)
  import_students_xlsx: (data) =>
    request({
      url: '/TEA_class/import_students_xlsx',
      method: 'post',
      data, // 注意：由于包含文件($binary)，调用此接口时请传入 FormData 对象 (包含 class_id 和 file)
    }),
  // ================= 题库管理 =================

  // 获取题目总数
  question_count: () =>
    request({
      url: '/TEA_question/count',
      method: 'get',
    }),

  // 新增标签
  create_tag: (data) =>
    request({
      url: '/TEA_question/tag/create',
      method: 'post',
      data, // 参数: { tag_name: "string" }
    }),

  // 删除标签
  delete_tag: (data) =>
    request({
      url: '/TEA_question/tag/delete',
      method: 'post',
      data, // 参数: { tag_id: 0 }
    }),

  // 获取标签列表
  tag_list: () =>
    request({
      url: '/TEA_question/tag/list',
      method: 'get',
    }),

  // 新增题目 (支持多图上传 - multipart/form-data)
  create_question: (data) =>
    request({
      url: '/TEA_question/create',
      method: 'post',
      data, // 注意: 需传入 FormData 对象 (包含 content_md, reference_answer, question_type, tag_ids_json, images 等)
    }),

  // 编辑题目 (支持替换图片或追加图片 - multipart/form-data)
  update_question: (data) =>
    request({
      url: '/TEA_question/update',
      method: 'post',
      data, // 注意: 需传入 FormData 对象 (包含 question_id, content_md, replace_images 等)
    }),

  // 删除题目
  delete_question: (data) =>
    request({
      url: '/TEA_question/delete',
      method: 'post',
      data, // 参数: { question_id: 0 }
    }),

  // 获取题目详情
  question_detail: (data) =>
    request({
      url: '/TEA_question/detail',
      method: 'post',
      data, // 参数: { question_id: 0 }
    }),

  // 搜索题目
  search_question: (data) =>
    request({
      url: '/TEA_question/search',
      method: 'post',
      data, // 参数: { keyword, tag_ids, status, page, page_size }
    }),
  // ================= 测验管理 =================

  // 创建测验发布
  create_quiz: (data) =>
    request({
      url: '/TEA_quiz/create',
      method: 'post',
      data, // 参数示例: { quiz_name: "string", class_ids: [1, 2], question_ids: [10, 11], deadline_at: "2026-03-11T07:35:30.799Z" }
    }),

  // 获取测验列表
  quiz_list: (data) =>
    request({
      url: '/TEA_quiz/list',
      method: 'post',
      data, // 参数示例: { status: "string", page: 1, page_size: 10 }
    }),
  // ================= 测验分析 (Analysis) =================

  // 获取分析总览摘要
  analysis_summary: () =>
    request({
      url: '/TEA_analysis/summary',
      method: 'post',
      data: {}, // 无需传参，但规范要求是 POST
    }),

  // 获取测验名称列表 (用于下拉选择等)
  quiz_name_list: () =>
    request({
      url: '/TEA_analysis/quiz_name_list',
      method: 'post',
      data: {},
    }),

  // 获取某个测验的班级统计数据
  quiz_class_stats: (data) =>
    request({
      url: '/TEA_analysis/quiz_class_stats',
      method: 'post',
      data, // 参数示例: { quiz_id: 1 }
    }),

  // 获取某个测验下具体班级的各题目统计数据
  quiz_class_question_stats: (data) =>
    request({
      url: '/TEA_analysis/quiz_class_question_stats',
      method: 'post',
      data, // 参数示例: { quiz_id: 1, class_id: 1 }
    }),

  // 获取学生答题列表
  student_answer_list: (data) =>
    request({
      url: '/TEA_analysis/student_answer_list',
      method: 'post',
      data, // 参数示例: { quiz_id: 1, class_id: 1, question_id: 1, page: 1, page_size: 10 }
    }),

  // 获取具体某次提交的答题详情
  student_answer_detail: (data) =>
    request({
      url: '/TEA_analysis/student_answer_detail',
      method: 'post',
      data, // 参数示例: { submission_id: 1 }
    }),
};
