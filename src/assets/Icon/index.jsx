// 提取文件名数组
export const getNameList = () => {
  const regex = /icon-(.*?)\.svg$/;
  return Object.keys(iconModules)
    .map((key) => {
      const match = key.match(regex);
      return match ? match[1] : null;
    })
    .filter(Boolean);
};
