---
title: 'Xây dựng multi-tenant websites với NuxtJS'
excerpt: 'Multi-tenant websites cho phép chúng ta chạy nhiều websites trên cùng một server instance với nhiều lợi ích giúp tiết kiệm tài nguyên server và chi phí cũng như thời gian phát triển. Hôm nay mình sẽ chia sẻ về cách mình xây dựng hệ thống nhiều websites này.'
coverImage: '/images/george-becker-129494.jpg'
date: '2021-02-21T08:35:07.322Z'
---

Về bối cách thực tế trong thời Covid, bán hàng online nở rộ, cửa hàng bánh mình đang làm thêm cũng gặp nhiều khó khăn trong bán hàng, mình nảy ra ý định xây trang web để bán bánh online giúp cửa hàng có thêm doanh thu. Khi về gặp đứa bạn chuyên bán hàng online để tìm hiểu nhu cầu thực tế và cách triển khai thì cũng được biết là bạn mình cũng muốn có trang web riêng để có thêm kênh bán hàng, và mình cũng gạ để mình làm cho luôn.

Đầu tiên mọi người đều sẽ hỏi sao không dùng mấy dịch vụ SaaS có sẵn như Shopify, Sapo… hay cài đặt Wordpress, Magento… nhỉ? Thật ra là một developer thì luôn luôn có suy nghĩ tự làm tự code từ đầu, chưa có sự thực dụng và nhạy bén trong kinh doanh và mình cũng tự tin là có thể làm ra những sản phẩm có nền tảng công nghệ tốt nhất nên là về mặt tinh thần là làm thôi, làm còn để học thêm nữa. Và ngoài ra thì với việc sử dụng SaaS mình cũng không có toàn quyền tuỳ chỉnh, dữ liệu thì cũng bị phụ thuộc, sử dụng mã nguồn mở thì đôi khi nó có quá nhiều thứ mình không hoặc chưa cần đến. Với những sản phẩm mã nguồn mở phổ biến kể trên như Wordpress hay Magento thì mình cũng đã đều dùng thử, công nhận là hệ thống plugins dày đặc cũng hỗ trợ mọi thứ từ A-Z sẽ là một giải pháp hoàn hảo nếu mình thuần phát triển kinh doanh. Đặc điểm của những mã nguồn kể trên phần giao diện vẫn là thuần server render một khối, những tính năng tương tác thường sẽ phát triển theo hệ jQuery. Mình thì mong muốn sử dụng những framework, library hiện đại như React hay Vue để xây dựng hơn.

Ở bài này mình sẽ tập trung vào phần phát triển front end, và làm sao để hỗ trợ chạy nhiều trang web trên cùng một server instance theo dạng multi-tenant để mình có thể dễ dàng làm thêm nhiều trang web nhanh chóng dễ dàng, mà vẫn đảm bảo sự tùy biến cần thiết, vì rất có thể ngoài những trang bán hàng kể trên mình sẽ làm thêm những trang tin tức, blog, landing page cho mình hoặc cho người thân thậm chí cho cả người ngoài với chi phí tiết kiệm.

Với đề bài ban đầu đặt ra là làm một trang web bán hàng, thì mình nghĩ ngay đến những yêu cầu công nghệ như sau:

- Server side rendering (mình muốn có trải nghiệm tốt và hỗ trợ SEO).
- Có dashboard cho việc quản lý bán hàng, SPA thôi là đủ.
- Để có trải nghiệm tốt thì mình sẽ làm cả bản mobile và desktop riêng, giao diện responsive chỉ để gọi là tránh vỡ.
- Chia sẻ được UI component nhiều nhất có thể.
- PWA

Có 2 ứng cử viên cho framework sử dụng đó là NextJS và NuxtJS cũng là đại diện cho React và Vue. Mình đã từng sử dụng cả 2 frameworks này rồi thì có mấy cân nhắc như sau:

- Đối với NextJS, gần đây nó có rất nhiều thay đổi và cải thiện tích cực về performance cũng như trải nghiệm dev, từ cơ chế SSG, tối ưu hình ảnh, React hỗ trợ Typescript tốt… nói chung là hoàn hảo để xây trang ecommerce.
- NuxtJS thì cũng là 1 framework yêu thích của mình với khả năng tuỳ biến cao qua những file configs, modules đa dạng. Nhưng có điều hiện giờ vẫn chưa chính thức hỗ trợ Vue 3 mới nhất. Cảm giác của mình là lo sợ khi làm xong thì nó lại nâng version mới.

Ban đầu mình cũng khá nghiêng về sử dụng NextJS và cũng thử init project, tuỳ biến để có thể hỗ trợ multi-tenant theo từng subfolders trong folder pages/. Đối với NextJS, có 2 phần việc chính phải làm là custom NextJS server để map lại những routes theo tenant, phần này khá dễ. Sửa đến đây khi chạy server lên sẽ không thấy gì, mở developer tools ra thì sẽ thấy hiện lỗi 404 khi NextJS cần load những thông tin props, manifest, khi này mình có view source lên thì thấy hiện đúng nội dung, chứng tỏ việc server side rendering diễn ra bình thường, vậy là vấn để xảy ra trong quá trình client side rehydration, để sửa cho phần này mình cần map lại những chỗ NextJS lấy thông tin props, manifest để hiển thị, mình cũng có Google thì cơ bản là NextJS không sinh ra cho việc này, rồi gạ dùng Vercel Mutli Zones. Chỉ còn cách sửa vào core của NextJS rồi, mò mấy hôm thì cũng sửa được nhưng việc sửa vào core khá mệt, do mình cần beautify rồi mò từng chỗ, việc folk lại cũng mệt không kém bởi vì NextJS đang trong giai đoạn active development. (Hiện giờ khi viết bài này thì mình biết là có cách khách để mokey-patching runtime)

Và cuối cùng mình đã quyết định dùng NuxtJS, bản thân hệ thống route của NuxtJS dựa trên Vue Router nên việc cài đặt cũng không quá khó, ngoài ra còn có thể dễ dàng viết thêm plugins mà không cần sửa core. Ý tưởng của mình cũng là sẽ tạo các folder tương ứng với các tenant nằm trong folder pages/ của Nuxt, rồi từ domain sẽ quyết định load folder nào trong folder pages. Cách thực hiện khá đơn giản, chỉ cần từ domain sẽ build lại route configs ứng theo từng tenant. Mình có làm 1 cái [module đơn giản ở đây](https://github.com/hieuhani/nuxt-multi-tenancy-module 'module đơn giản ở đây') cho việc này.
Tiếp theo đặt tenant trong folder pages nghe cũng không xịn, (NuxtJS sử dụng file-based routes) vậy nên mình muốn đổi tên thành folder sites. Thật may mắn vì NuxtJS cho đổi tên folder pages một cách dễ dàng qua [Nuxt config](https://nuxtjs.org/docs/2.x/directory-structure/nuxt-config/#dir 'Nuxt config').

Đối với Nuxt mình cũng có thể linh hoạt quyết định trang nào SSR trang nào CSR một cách đơn giản dễ dàng thông qua Nuxt config hoặc Nuxt middleware, hoặc đặt trong component client-only.

Sau khi đã hoàn thành việc hỗ trợ multi-tenant qua việc map tên miền với tệp các routes tương ứng trong folder sites thì mình đã tự tin hơn cho ý tưởng này.

Tiếp theo trong quá trình làm thì mình nhận thấy giữa các trang web có rất nhiều điểm giống nhau, khác nhau có lẽ là đôi chút màu sắc, typography, vì vậy lại nghĩ đến giải pháp dài hơi hơn là cấu trúc để làm sao sử dụng lại được nhiều nhất, nghĩ ngay đến làm theme và xây bộ UI components.
