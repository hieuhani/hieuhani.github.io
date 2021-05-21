---
title: 'Xây dựng multi-tenant websites với NuxtJS'
excerpt: 'Multi-tenant websites cho phép chúng ta chạy nhiều websites trên cùng một server instance với nhiều lợi ích giúp tiết kiệm tài nguyên server và chi phí cũng như thời gian phát triển. Hôm nay mình sẽ chia sẻ về cách mình xây dựng hệ thống nhiều website này.'
coverImage: '/images/george-becker-129494.jpg'
date: '2021-02-21T08:35:07.322Z'
---

Về bối cách thực tế trong thời Covid, bán hàng online nở rộ, cửa hàng bánh mình đang làm thêm cũng gặp nhiều khó khăn trong bán hàng, mình nảy ra ý định xây trang web bán hàng, khi về nói chuyện với bạn cũng chuyên bán mĩ phẩm online thì bạn ý cũng mong muốn có trang web riêng.

OK, đầu tiên mọi người đều sẽ hỏi sao không dùng mấy dịch vụ SaaS có sẵn như Shopify, Sapo… hay cài đặt Wordpress, Magento… nhỉ? Thì đơn giản là mình là một developer thôi, nên mình thích thì làm thôi. Và ngoài ra thì với việc sử dụng SaaS mình cũng không có toàn quyền tuỳ chỉnh, sử dụng mã nguồn mở thì mất công tìm hiểu, và lý do chính là khó để dựng nhiều website cùng lúc với việc tuỳ chỉnh giao diện dễ dàng.

Ở bài này mình sẽ tập trung vào phần front end.

Với đề bài đặt ra là làm một trang web bán hàng, thì mình nghĩ ngay đến những yêu cầu công nghệ như sau:

- Server side rendering (mình muốn có trải nghiệm tốt và hỗ trợ SEO).
- Có dashboard cho việc quản lý bán hàng, SPA thôi là đủ.
- Để có trải nghiệm tốt thì mình sẽ làm cả bản mobile và desktop riêng, giao diện responsive chỉ để gọi là tránh vỡ.
- Chia sẻ được UI component nhiều nhất có thể.

Có 2 ứng cử viên cho framework sử dụng là NextJS và NuxtJS cũng đại diện cho React và Vue. Mình đã từng sử dụng cả 2 frameworks này rồi thì có mấy cân nhắc như sau:

- Đối với NextJS, gần đây nó có rất nhiều thay đổi và cải thiện tích cực về performance cũng như trải nghiệm dev, từ cơ chế SSG, tối ưu hình ảnh, React hỗ trợ Typescript tốt…
- NuxtJS thì là 1 framework yêu thích của mình với khả năng tuỳ biến cao qua những config, plugins đa dạng. Nhưng có điều hiện giờ vẫn chưa hỗ trợ Vue 3 tất nhiên vẫn có thể dùng qua hỗ trợ từ cộng đồng.

Ban đầu mình khá nghiên về NextJS và cũng thử setup project, tuỳ biến để có thể hỗ trợ multi-tenant theo từng subfolders trong folder pages/. Đối với NextJS, có 2 phần việc chính phải làm là custom NextJS server để map lại những route theo tenant, phần này khá dễ. Sửa đến đây khi chạy server lên sẽ không thấy gì, mở developer tools ra thì sẽ thấy hiện lỗi 404, khi này mình có view source lên thì thấy hiện đúng nội dung, vậy là vấn để xảy ra trong quá trình client side rehydration, để sửa cho phần này buộc lòng phải sửa vào core của NextJS rồi, mò mấy hôm thì cũng sửa được nhưng việc sửa vào core khá mệt, folk lại cũng mệt không kém bởi vì nó tăng version đều cùng rất nhiều bản patch. (hiện giờ mình biết là có cách khách để mokey patching runtime, nhưng too late 😁)

Và cuối cùng mình đã quyết định dùng NuxtJS, bản thân hệ thống route của NuxtJS dựa trên Vue Router nên việc cài đặt cũng không quá khó, ngoài ra còn có thể dễ dàng viết thêm plugins mà không cần sửa core. Ý tưởng của mình cũng là sẽ tạo các folder tương ứng với các tenant nằm trong folder pages/ của Nuxt, rồi map từ domain sẽ quyết định load folder nào trong pages. Cách thực hiện khá đơn giản, chỉ cần từ domain sẽ build lại route configs. Mình có làm 1 cái [module đơn giản ở đây](https://github.com/hieuhani/nuxt-multi-tenancy-module 'module đơn giản ở đây'). Ngoài ra folder pages nghe cũng không xịn, mình cũng đã đổi tên thành sites. Thật may mắn vì NuxtJS cho đổi tên folder pages 1 cách dễ dàng qua [Nuxt config](https://nuxtjs.org/docs/2.x/directory-structure/nuxt-config/#dir 'Nuxt config').

Đối với Nuxt mình có thể linh hoạt quyết định trang nào SSR trang nào CSR một cách đơn giản dễ dàng thông qua Nuxt config. Hoặc đặt trong component client-only

Sau khi đã hoàn thành việc hỗ trợ multi-tenant qua việc map tên miền với tệp các routes tương ứng trong folder sites thì mình đã tự tin hơn cho ý tưởng này.

Tiếp theo trong quá trình làm thì mình nhận thấy giữa các trang web có rất nhiều điểm giống nhau, khác nhau có lẽ là đôi chút màu sắc, typography, vì vậy lại nghĩ đến giải pháp dài hơi hơn là cấu trúc để làm sao sử dụng lại được nhiều nhất, nghĩ ngay đến làm theme và xây bộ UI components.
