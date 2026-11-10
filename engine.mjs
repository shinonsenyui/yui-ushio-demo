export const initialState = { headline: '想い出になる、\nその一日を。', theme: 'original', first: 'wedding' };
export function interpret(input) {
 const text = String(input).trim().normalize('NFKC');
 if (!text) return {kind:'empty'};
 if (/^(最初|初期|全部|すべて).*(戻|リセット)|^リセット/.test(text)) return {kind:'reset'};
 if (/^(ひとつ|一つ|1つ|元に|前に|直前).*(戻)|^undo$/i.test(text)) return {kind:'undo'};
 const changes = {}, descriptions = [];
 const title = text.match(/(?:見出し|キャッチコピー|タイトル)(?:を|は|:)?\s*[「『"“](.+?)[」』"”]/s) || text.match(/(?:見出し|キャッチコピー|タイトル)を\s*(.+?)(?:に(?:変更|変|して)|へ(?:変更|変))/s);
 if (title) {
  const value=title[1].trim();
  if (!value || [...value].length>60) return {kind:'unsupported',message:'見出しは1〜60文字で指定してください。例：見出しを「今を、未来の宝物に。」にして'};
  changes.headline=value; descriptions.push('メインの見出し');
 }
 if (/(色|背景|配色|雰囲気|テーマ)|(?:ピンク|青|ブルー|ラベンダー|紫|ベージュ|グリーン).*に/.test(text)) {
  const themes=[['rose',/ピンク|ローズ/,'淡いピンク'],['blue',/ブルー|青/,'落ち着いたブルー'],['lavender',/ラベンダー|紫/,'ラベンダー'],['original',/ベージュ|グリーン|緑|元の配色/,'ナチュラルな配色']];
  const match=themes.find(([,pattern])=>pattern.test(text));
  if(match){changes.theme=match[0];descriptions.push(`配色を${match[2]}`);}
 }
 if(/(先頭|一番上|最初|トップ|優先)/.test(text)){
  const category=[['children',/七五三|キッズ|子ども|子供/,'七五三・キッズ'],['wedding',/ウェディング|ウエディング|ブライダル|結婚/,'フォトウェディング'],['coming',/成人|卒業|振袖/,'成人式・卒業式']].find(([,pattern])=>pattern.test(text));
  if(category){changes.first=category[0];descriptions.push(`${category[2]}を先頭`);}
 }
 if(Object.keys(changes).length) return {kind:'change',changes,message:`${descriptions.join('、')}に変更しました。見本ページで確認できます。`};
 return {kind:'unsupported',message:'この体験版で変更できるのは、見出し・配色（ピンク／ブルー／ラベンダー／ベージュ）・サービスの順番です。例えば「見出しを『今を、未来の宝物に。』にして」と入力してみてください。'};
}
