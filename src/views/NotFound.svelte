<script>
  function goHome() {
    window.location.hash = '#/'
  }
</script>

<div class="not-found">
  <div class="nf-content">
    <h1 class="nf-code">404</h1>
    <p class="nf-message">页面不存在</p>
    <p class="nf-tip">您访问的页面不存在或已被删除</p>
    <button class="btn" on:click={goHome}>返回首页</button>
  </div>
</div>

<style>
  .not-found {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
  }

  .nf-content {
    text-align: center;
  }

  .nf-code {
    font-size: 120px;
    font-weight: 700;
    color: #e5e6eb;
    line-height: 1;
    margin-bottom: 16px;
  }

  .nf-message {
    font-size: 20px;
    font-weight: 500;
    color: #1f2329;
    margin-bottom: 8px;
  }

  .nf-tip {
    font-size: 14px;
    color: #86909c;
    margin-bottom: 24px;
  }

  .btn {
    padding: 10px 24px;
    background: #3370ff;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn:hover {
    background: #265cd1;
  }
</style>
